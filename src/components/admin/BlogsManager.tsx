import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Star,
    Eye,
    Calendar,
    FileText,
    Loader2,
    ExternalLink
} from 'lucide-react';
import BlogEditor from './BlogEditor';
import { toast } from 'sonner';

const API_BASE = '/api';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    coverImageAlt?: string;
    tags: string[];
    category?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    status: 'draft' | 'published';
    publishedAt: string;
    authorId: string;
    featured?: boolean;
    viewCount?: number;
    readingTime?: number;
    createdAt: string;
    updatedAt: string;
}

export default function BlogsManager() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/blogs/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleEditBlog = async (id: string) => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/blogs/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch blog details');
            const blogData = await res.json();
            setEditingBlog(blogData);
            setIsCreating(true);
        } catch (error) {
            toast.error('Failed to load blog for editing');
        }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;

        const loadingToast = toast.loading('Deleting blog post...');
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/blogs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete blog');
            toast.dismiss(loadingToast);
            toast.success('🗑️ Blog post deleted successfully!');
            fetchBlogs();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to delete blog');
        }
    };

    const handleToggleFeatured = async (blog: Blog) => {
        const loadingToast = toast.loading('Updating featured status...');
        
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/blogs/${blog.id}/featured`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Failed to update featured status');
            toast.dismiss(loadingToast);
            toast.success(blog.featured ? '⭐ Removed from featured' : '⭐ Marked as featured!');
            fetchBlogs();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to update featured status');
        }
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isCreating) {
        return (
            <BlogEditor
                editBlog={editingBlog || undefined}
                onSuccess={() => {
                    setIsCreating(false);
                    setEditingBlog(null);
                    fetchBlogs();
                }}
                onCancel={() => {
                    setIsCreating(false);
                    setEditingBlog(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
                    <p className="text-sm text-zinc-400 mt-1">Manage your blog content</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBlog(null);
                        setIsCreating(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Post
                </button>
            </div>

            {/* Filters */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'published', label: 'Published' },
                            { id: 'draft', label: 'Drafts' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => setStatusFilter(status.id as any)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    statusFilter === status.id
                                        ? 'bg-white text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Blog List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                            {searchQuery || statusFilter !== 'all' ? 'No blogs found' : 'No blog posts yet'}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first blog post to get started'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Create First Post
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {filteredBlogs.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 hover:bg-zinc-800/30 transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Cover Image */}
                                    {blog.coverImage ? (
                                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                                            <img
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-zinc-600" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                                        {blog.title}
                                                    </h3>
                                                    {blog.featured && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                                                    {blog.excerpt}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                                                        blog.status === 'published'
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                        {blog.status === 'published' ? 'Published' : 'Draft'}
                                                    </span>
                                                    {blog.category && (
                                                        <span className="px-2 py-1 bg-zinc-800 rounded-full capitalize">
                                                            {blog.category}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {blog.viewCount || 0} views
                                                    </span>
                                                    {blog.readingTime && (
                                                        <span>{blog.readingTime} min read</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <button
                                                    onClick={() => handleToggleFeatured(blog)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        blog.featured
                                                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                            : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
                                                    }`}
                                                    title={blog.featured ? 'Remove from featured' : 'Mark as featured'}
                                                >
                                                    <Star className={`w-4 h-4 ${blog.featured ? 'fill-current' : ''}`} />
                                                </button>
                                                {blog.status === 'published' && (
                                                    <a
                                                        href={`/blog/${blog.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                                                        title="View post"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleEditBlog(blog.id)}
                                                    className="p-2 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBlog(blog.id)}
                                                    className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {blog.tags.slice(0, 5).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {blog.tags.length > 5 && (
                                                    <span className="px-2 py-0.5 text-zinc-500 text-xs">
                                                        +{blog.tags.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {filteredBlogs.length > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                        <p className="text-sm text-zinc-500">
                            Showing {filteredBlogs.length} of {blogs.length} blog posts
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
