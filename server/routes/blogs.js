import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dynamoDB from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const TABLE_NAME = 'Blogs';
const BUCKET_NAME = 'kokorick-assets';

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Helper: Convert Stream to String
const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

// Helper: Generate slug from title
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

// PUBLIC: Get all blogs (metadata only)
router.get('/', async (req, res) => {
    try {
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const blogs = (result.Items || [])
            .filter(b => b.status === 'published')
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        // Don't send content in list view
        const blogsWithoutContent = blogs.map(({ s3Key, ...rest }) => rest);
        res.json(blogsWithoutContent);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUBLIC: Get all blogs for admin (includes drafts)
router.get('/admin', auth, async (req, res) => {
    try {
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const blogs = (result.Items || [])
            .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUBLIC: Get single blog by slug or ID
router.get('/:slugOrId', async (req, res) => {
    const { slugOrId } = req.params;

    try {
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const blog = (result.Items || []).find(
            b => b.slug === slugOrId || b.id === slugOrId
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Only show published blogs to public (unless admin request)
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (blog.status !== 'published' && !token) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Fetch content from S3 if s3Key exists
        let content = blog.content || '';
        if (blog.s3Key) {
            try {
                const s3Response = await s3Client.send(new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: blog.s3Key
                }));
                content = await streamToString(s3Response.Body);
            } catch (s3Error) {
                console.error('Error fetching content from S3:', s3Error);
                // Fall back to stored content if S3 fails
            }
        }

        // Increment view count
        if (blog.status === 'published') {
            const updatedBlog = {
                ...blog,
                viewCount: (blog.viewCount || 0) + 1
            };
            await dynamoDB.put({ TableName: TABLE_NAME, Item: updatedBlog }).promise();
        }

        res.json({ ...blog, content });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: error.message });
    }
});

// PROTECTED: Create new blog
router.post('/', auth, async (req, res) => {
    const {
        title,
        slug,
        excerpt,
        content,
        tags,
        category,
        coverImage,
        coverImageAlt,
        metaTitle,
        metaDescription,
        focusKeyword,
        canonicalUrl,
        status,
        publishedAt,
        featured,
        readingTime,
        authorId
    } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const id = uuidv4();
    const s3Key = `posts/${id}.html`;
    const finalPublishedAt = publishedAt || new Date().toISOString();
    const finalSlug = slug || generateSlug(title);

    try {
        // Upload content to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: content,
            ContentType: 'text/html'
        }));

        // If marking as featured, unfeatured all other blogs first
        if (featured) {
            const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
            const updatePromises = (result.Items || [])
                .filter(blog => blog.featured)
                .map(blog => dynamoDB.put({
                    TableName: TABLE_NAME,
                    Item: { ...blog, featured: false }
                }).promise());
            await Promise.all(updatePromises);
        }

        // Save metadata to DB
        const blogData = {
            id,
            title,
            slug: finalSlug,
            excerpt: excerpt || '',
            tags: tags || [],
            category: category || 'uncategorized',
            coverImage: coverImage || '',
            coverImageAlt: coverImageAlt || '',
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt || '',
            focusKeyword: focusKeyword || '',
            canonicalUrl: canonicalUrl || '',
            status: status || 'draft',
            s3Key,
            publishedAt: finalPublishedAt,
            authorId: authorId || req.user?.username || 'Admin',
            featured: featured || false,
            readingTime: readingTime || 0,
            viewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: blogData }).promise();

        res.status(201).json({ id, message: 'Blog created successfully', blog: blogData });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: error.message });
    }
});

// PROTECTED: Update blog
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const {
        title,
        slug,
        excerpt,
        content,
        tags,
        category,
        coverImage,
        coverImageAlt,
        metaTitle,
        metaDescription,
        focusKeyword,
        canonicalUrl,
        status,
        publishedAt,
        featured,
        readingTime
    } = req.body;

    try {
        // Find existing blog
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const existingBlog = (result.Items || []).find(b => b.id === id);

        if (!existingBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const s3Key = existingBlog.s3Key;

        // Update content in S3 if provided
        if (content !== undefined && content !== null) {
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: content,
                ContentType: 'text/html'
            }));
        }

        // If marking as featured, unfeatured all other blogs first
        if (featured === true && !existingBlog.featured) {
            const allBlogs = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
            const updatePromises = (allBlogs.Items || [])
                .filter(blog => blog.featured && blog.id !== id)
                .map(blog => dynamoDB.put({
                    TableName: TABLE_NAME,
                    Item: { ...blog, featured: false }
                }).promise());
            await Promise.all(updatePromises);
        }

        // Update metadata
        const updatedBlog = {
            ...existingBlog,
            title: title !== undefined ? title : existingBlog.title,
            slug: slug !== undefined ? slug : existingBlog.slug,
            excerpt: excerpt !== undefined ? excerpt : existingBlog.excerpt,
            tags: tags !== undefined ? tags : existingBlog.tags,
            category: category !== undefined ? category : existingBlog.category,
            coverImage: coverImage !== undefined ? coverImage : existingBlog.coverImage,
            coverImageAlt: coverImageAlt !== undefined ? coverImageAlt : existingBlog.coverImageAlt,
            metaTitle: metaTitle !== undefined ? metaTitle : existingBlog.metaTitle,
            metaDescription: metaDescription !== undefined ? metaDescription : existingBlog.metaDescription,
            focusKeyword: focusKeyword !== undefined ? focusKeyword : existingBlog.focusKeyword,
            canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : existingBlog.canonicalUrl,
            status: status !== undefined ? status : existingBlog.status,
            publishedAt: publishedAt !== undefined ? publishedAt : existingBlog.publishedAt,
            featured: featured !== undefined ? featured : existingBlog.featured,
            readingTime: readingTime !== undefined ? readingTime : existingBlog.readingTime,
            updatedAt: new Date().toISOString()
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: updatedBlog }).promise();

        res.json({ message: 'Blog updated successfully', id, blog: updatedBlog });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: error.message });
    }
});

// PROTECTED: Delete blog
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        // Find blog
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const blog = (result.Items || []).find(b => b.id === id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Delete from S3
        if (blog.s3Key) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: blog.s3Key
                }));
            } catch (s3Error) {
                console.error('S3 deletion error:', s3Error);
                // Continue even if S3 deletion fails
            }
        }

        // Delete from DB
        await dynamoDB.delete({ TableName: TABLE_NAME, Key: { id } }).promise();

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: error.message });
    }
});

// PROTECTED: Toggle featured status
router.patch('/:id/featured', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        const blog = (result.Items || []).find(b => b.id === id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const newFeatured = !blog.featured;

        // If marking as featured, unfeatured all other blogs first
        if (newFeatured) {
            const updatePromises = (result.Items || [])
                .filter(b => b.featured && b.id !== id)
                .map(b => dynamoDB.put({
                    TableName: TABLE_NAME,
                    Item: { ...b, featured: false }
                }).promise());
            await Promise.all(updatePromises);
        }

        const updatedBlog = {
            ...blog,
            featured: newFeatured,
            updatedAt: new Date().toISOString()
        };

        await dynamoDB.put({ TableName: TABLE_NAME, Item: updatedBlog }).promise();

        res.json({ message: `Blog ${newFeatured ? 'marked as featured' : 'removed from featured'}`, blog: updatedBlog });
    } catch (error) {
        console.error('Error toggling featured:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
