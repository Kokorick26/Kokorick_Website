import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

// Configure S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = 'kokorick-assets';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 35 * 1024 * 1024, // 35MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.'));
        }
    },
});

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const folder = req.body.folder || 'general';
        const fileExtension = path.extname(file.originalname);
        const fileName = `${folder}/${uuidv4()}${fileExtension}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${fileName}`;

        res.json({
            success: true,
            url: imageUrl,
            key: fileName,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image', details: error.message });
    }
});

// Delete image
router.delete('/image', async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'No key provided' });
        }

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        await s3Client.send(new DeleteObjectCommand(deleteParams));

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete image', details: error.message });
    }
});

// Upload image from URL
router.post('/image-url', async (req, res) => {
    try {
        const { url, folder = 'blog-content' } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'No URL provided' });
        }

        // Fetch the image from the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await response.arrayBuffer());

        // Determine file extension from content type
        const extensionMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
        };
        const fileExtension = extensionMap[contentType] || '.jpg';
        const fileName = `${folder}/${uuidv4()}${fileExtension}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${fileName}`;

        res.json({
            success: true,
            url: imageUrl,
            key: fileName,
        });
    } catch (error) {
        console.error('URL upload error:', error);
        res.status(500).json({ error: 'Failed to upload image from URL', details: error.message });
    }
});

export default router;
