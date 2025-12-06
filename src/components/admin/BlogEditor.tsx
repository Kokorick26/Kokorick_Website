import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Loader2,
    Upload,
    X,
    Save,
    Send,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Tag,
    ArrowLeft,
    Youtube
} from 'lucide-react';
import { toast } from 'sonner';

// Note: We don't register custom fonts to avoid duplicate dropdown issues
// Using Quill's default font handling instead

const API_BASE = '/api';

// URL Detection Helpers
const isYouTubeUrl = (url: string): boolean => {
    return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)/.test(url);
};

const getYouTubeEmbedUrl = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
    }
    return null;
};

const isImageUrl = (url: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url) ||
        url.includes('images') ||
        url.includes('/image') ||
        url.includes('_next/image');
};

const isVimeoUrl = (url: string): boolean => {
    return /vimeo\.com\/\d+/.test(url);
};

const getVimeoEmbedUrl = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
        return `https://player.vimeo.com/video/${match[1]}`;
    }
    return null;
};

// Upload image to S3
const uploadImageToS3 = async (file: File, folder: string = 'blog-content'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/upload/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
    } catch (err) {
        console.error('Image upload failed:', err);
        return null;
    }
};

// Upload image from URL to S3
const uploadImageFromUrl = async (imageUrl: string, folder: string = 'blog-content'): Promise<string | null> => {
    try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/upload/image-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ url: imageUrl, folder })
        });

        if (!res.ok) {
            // If URL upload not supported, return original URL
            return imageUrl;
        }
        const data = await res.json();
        return data.url;
    } catch (err) {
        // Fallback to original URL
        return imageUrl;
    }
};

interface BlogEditorProps {
    onSuccess: () => void;
    onCancel: () => void;
    editBlog?: {
        id: string;
        title: string;
        slug?: string;
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
        status?: 'draft' | 'published';
        publishedAt?: string;
        featured?: boolean;
        readingTime?: number;
    };
}

const BlogEditor = ({ onSuccess, onCancel, editBlog }: BlogEditorProps) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo' | 'settings'>('content');
    const quillRef = useRef<ReactQuill>(null);

    // Basic Info
    const [title, setTitle] = useState(editBlog?.title || '');
    const [slug, setSlug] = useState(editBlog?.slug || '');
    const [excerpt, setExcerpt] = useState(editBlog?.excerpt || '');
    const [content, setContent] = useState(editBlog?.content || '');

    // Media
    const [coverImage, setCoverImage] = useState(editBlog?.coverImage || '');
    const [coverImageAlt, setCoverImageAlt] = useState(editBlog?.coverImageAlt || '');
    const [uploading, setUploading] = useState(false);

    // Categorization
    const [tags, setTags] = useState<string[]>(editBlog?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [category, setCategory] = useState(editBlog?.category || '');

    // SEO & Meta
    const [metaTitle, setMetaTitle] = useState(editBlog?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(editBlog?.metaDescription || '');
    const [focusKeyword, setFocusKeyword] = useState(editBlog?.focusKeyword || '');
    const [canonicalUrl, setCanonicalUrl] = useState(editBlog?.canonicalUrl || '');

    // Publishing Options
    const [publishDate, setPublishDate] = useState(
        editBlog?.publishedAt
            ? new Date(editBlog.publishedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
    );
    const [featured, setFeatured] = useState(editBlog?.featured || false);

    // Reading Time (auto-calculated)
    const [readingTime, setReadingTime] = useState(editBlog?.readingTime || 0);

    // Auto-generate slug from title
    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    };

    // Calculate reading time
    const calculateReadingTime = (text: string) => {
        const wordsPerMinute = 200;
        const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    // Update reading time when content changes
    useEffect(() => {
        setReadingTime(calculateReadingTime(content));
    }, [content]);

    // Track if user manually edited slug
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!editBlog?.slug);

    // Auto-generate slug when title changes (only if not manually edited)
    useEffect(() => {
        if (title && !slugManuallyEdited) {
            setSlug(generateSlug(title));
        }
    }, [title, slugManuallyEdited]);

    // Auto-fill meta title if empty
    useEffect(() => {
        if (title && !metaTitle) {
            setMetaTitle(title);
        }
    }, [title]);

    // Auto-fill meta description if empty
    useEffect(() => {
        if (excerpt && !metaDescription) {
            setMetaDescription(excerpt);
        }
    }, [excerpt]);

    // Handle paste events for images and URLs
    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        // Check for pasted images (files)
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    toast.loading('Uploading pasted image...');
                    const url = await uploadImageToS3(file, 'blog-content');
                    if (url) {
                        const range = quill.getSelection() || { index: quill.getLength() };
                        quill.insertEmbed(range.index, 'image', url);
                        quill.setSelection(range.index + 1, 0);
                        toast.dismiss();
                        toast.success('Image uploaded successfully');
                    } else {
                        toast.dismiss();
                        toast.error('Failed to upload image');
                    }
                }
                return;
            }
        }

        // Check for pasted text that might be a URL
        const pastedText = clipboardData.getData('text/plain').trim();
        if (pastedText && /^https?:\/\//i.test(pastedText)) {
            // It's a URL - check what kind
            if (isYouTubeUrl(pastedText)) {
                e.preventDefault();
                const embedUrl = getYouTubeEmbedUrl(pastedText);
                if (embedUrl) {
                    const range = quill.getSelection() || { index: quill.getLength() };
                    quill.insertEmbed(range.index, 'video', embedUrl);
                    quill.setSelection(range.index + 1, 0);
                    toast.success('YouTube video embedded');
                }
            } else if (isVimeoUrl(pastedText)) {
                e.preventDefault();
                const embedUrl = getVimeoEmbedUrl(pastedText);
                if (embedUrl) {
                    const range = quill.getSelection() || { index: quill.getLength() };
                    quill.insertEmbed(range.index, 'video', embedUrl);
                    quill.setSelection(range.index + 1, 0);
                    toast.success('Vimeo video embedded');
                }
            } else if (isImageUrl(pastedText)) {
                e.preventDefault();
                toast.loading('Processing image URL...');
                // Try to upload the image to S3, fallback to direct URL
                const uploadedUrl = await uploadImageFromUrl(pastedText, 'blog-content');
                const finalUrl = uploadedUrl || pastedText;
                const range = quill.getSelection() || { index: quill.getLength() };
                quill.insertEmbed(range.index, 'image', finalUrl);
                quill.setSelection(range.index + 1, 0);
                toast.dismiss();
                toast.success('Image added');
            }
            // For other URLs, let Quill handle normally (it will create a link)
        }
    }, []);

    // Attach paste handler to Quill editor
    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const editorElement = quill.root;
            const pasteHandler = handlePaste as unknown as EventListener;
            editorElement.addEventListener('paste', pasteHandler);
            return () => {
                editorElement.removeEventListener('paste', pasteHandler);
            };
        }
    }, [handlePaste]);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files ? input.files[0] : null;
                        if (file) {
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('folder', 'blog-content');

                            try {
                                toast.loading('Uploading image...');
                                const token = localStorage.getItem('adminToken');

                                const res = await fetch(`${API_BASE}/upload/image`, {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: formData
                                });

                                if (!res.ok) throw new Error('Upload failed');

                                const data = await res.json();
                                const quill = (this as any).quill;
                                const range = quill.getSelection();
                                quill.insertEmbed(range.index, 'image', data.url);

                                toast.dismiss();
                                toast.success('Image uploaded successfully');
                            } catch (err) {
                                console.error(err);
                                toast.dismiss();
                                toast.error('Failed to upload image');
                            }
                        }
                    };
                },
                video: function () {
                    const url = prompt('Enter YouTube URL or Video URL:');
                    if (url) {
                        let embedUrl = url;
                        if (url.includes('youtube.com/watch?v=')) {
                            const videoId = url.split('v=')[1]?.split('&')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (url.includes('youtu.be/')) {
                            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                        const quill = (this as any).quill;
                        const range = quill.getSelection();
                        quill.insertEmbed(range.index, 'video', embedUrl);
                    }
                }
            }
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const loadingToast = toast.loading('Uploading cover image...');

        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', 'blog-covers');

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/upload/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setCoverImage(data.url);
            toast.dismiss(loadingToast);
            toast.success('Cover image uploaded successfully');
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to upload cover image');
        } finally {
            setUploading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            // Split by comma and add each tag
            const newTags = tagInput
                .split(',')
                .map(t => t.trim())
                .filter(t => t && !tags.includes(t));
            if (newTags.length > 0) {
                setTags([...tags, ...newTags]);
            }
            setTagInput('');
        }
    };

    const handleTagInputChange = (value: string) => {
        // If pasting comma-separated values, auto-add them
        if (value.includes(',')) {
            const newTags = value
                .split(',')
                .map(t => t.trim())
                .filter(t => t && !tags.includes(t));
            if (newTags.length > 0) {
                setTags([...tags, ...newTags]);
            }
            setTagInput('');
        } else {
            setTagInput(value);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent, saveStatus: 'draft' | 'published') => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Content is required');
            return;
        }
        if (!excerpt.trim()) {
            toast.error('Excerpt is required');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(editBlog ? 'Updating blog post...' : 'Creating blog post...');

        try {
            const token = localStorage.getItem('adminToken');
            const blogData = {
                title,
                slug: slug || generateSlug(title),
                excerpt,
                content,
                coverImage,
                coverImageAlt,
                tags,
                category,
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || excerpt,
                focusKeyword,
                canonicalUrl,
                status: saveStatus,
                publishedAt: saveStatus === 'published' ? publishDate : null,
                featured,
                readingTime,
                authorId: 'Admin'
            };

            const url = editBlog
                ? `${API_BASE}/blogs/${editBlog.id}`
                : `${API_BASE}/blogs`;

            const method = editBlog ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(blogData)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to ${editBlog ? 'update' : 'create'} post`);
            }

            toast.dismiss(loadingToast);

            if (editBlog) {
                toast.success('Blog post updated successfully');
            } else if (saveStatus === 'published') {
                toast.success('Blog post published successfully');
            } else {
                toast.success('Blog post saved as draft');
            }

            onSuccess();
        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error(error.message || `Failed to ${editBlog ? 'update' : 'create'} blog post`);
            console.error('Blog save error:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'seo', label: 'SEO', icon: LinkIcon },
        { id: 'settings', label: 'Settings', icon: Tag }
    ];

    const categories = [
        { value: 'technology', label: 'Technology' },
        { value: 'design', label: 'Design' },
        { value: 'development', label: 'Development' },
        { value: 'business', label: 'Business' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'case-study', label: 'Case Study' },
        { value: 'news', label: 'News' }
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {editBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                {editBlog ? 'Update your blog content and settings' : 'Create engaging content with our professional blog editor'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'draft')}
                            disabled={loading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'published')}
                            disabled={loading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Publish
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter an engaging title..."
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-lg"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500">{title.length}/100 characters</p>
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">URL Slug</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-zinc-500">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => {
                                                setSlug(e.target.value);
                                                setSlugManuallyEdited(true);
                                            }}
                                            placeholder="auto-generated-from-title"
                                            className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Excerpt */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Excerpt *</label>
                                    <textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Write a compelling summary (160 characters recommended)..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                                        required
                                    />
                                    <p className="text-xs text-zinc-500">{excerpt.length}/160 characters</p>
                                </div>

                                {/* Content Editor */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Content *</label>
                                    <div className="prose-editor border border-zinc-700 rounded-xl overflow-hidden">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={content}
                                            onChange={setContent}
                                            modules={modules}
                                            className="bg-zinc-800/50"
                                            placeholder="Start writing your amazing content..."
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Youtube className="w-3 h-3" />
                                        Paste YouTube/Vimeo URLs to auto-embed • Paste images to auto-upload
                                    </p>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Quick Stats */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Content Stats</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Words:</span>
                                            <span className="text-white font-medium">
                                                {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Reading Time:</span>
                                            <span className="text-white font-medium">{readingTime} min</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Characters:</span>
                                            <span className="text-white font-medium">{content.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Category</h3>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Tags (comma separated)</h3>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => handleTagInputChange(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="AI, React, Python..."
                                            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700 text-zinc-300 rounded-lg text-xs">
                                                {tag}
                                                <X
                                                    className="w-3 h-3 cursor-pointer hover:text-white"
                                                    onClick={() => handleRemoveTag(tag)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Cover Image</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Upload a high quality cover image (recommended: 1200x630px)
                            </p>
                        </div>

                        {coverImage ? (
                            <div className="relative w-full h-64 rounded-xl overflow-hidden border border-zinc-700">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setCoverImage('')}
                                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="block border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center cursor-pointer hover:border-zinc-600 transition-colors">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
                                <span className="text-blue-400 hover:underline">Click to upload</span>
                                <span className="text-zinc-500"> or drag and drop</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                                <p className="text-xs text-zinc-500 mt-2">PNG, JPG, GIF up to 35MB</p>
                            </label>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-300">Or enter image URL</label>
                                <input
                                    type="text"
                                    value={coverImage}
                                    onChange={(e) => setCoverImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-300">Alt Text (for accessibility)</label>
                                <input
                                    type="text"
                                    value={coverImageAlt}
                                    onChange={(e) => setCoverImageAlt(e.target.value)}
                                    placeholder="Describe the image..."
                                    className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Search Engine Optimization</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Optimize your content for search engines
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Meta Title</label>
                            <input
                                type="text"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="SEO-optimized title..."
                                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-zinc-500">{metaTitle.length}/60 characters (recommended)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Meta Description</label>
                            <textarea
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="SEO-optimized description..."
                                rows={3}
                                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                            />
                            <p className="text-xs text-zinc-500">{metaDescription.length}/160 characters (recommended)</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Focus Keyword</label>
                            <input
                                type="text"
                                value={focusKeyword}
                                onChange={(e) => setFocusKeyword(e.target.value)}
                                placeholder="Main keyword for this post..."
                                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Canonical URL (optional)</label>
                            <input
                                type="text"
                                value={canonicalUrl}
                                onChange={(e) => setCanonicalUrl(e.target.value)}
                                placeholder="https://example.com/original-post"
                                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">Publishing Settings</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">Publish Date</label>
                            <input
                                type="date"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                            <div>
                                <label className="block text-sm font-medium text-white">Featured Post</label>
                                <p className="text-sm text-zinc-400">
                                    Show this post prominently on the homepage
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFeatured(!featured)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${featured ? 'bg-blue-500' : 'bg-zinc-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${featured ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Styles */}
            <style>{`
                .ql-toolbar.ql-snow {
                    background: rgb(39 39 42 / 0.5);
                    border-color: rgb(63 63 70);
                    border-radius: 0.75rem 0.75rem 0 0;
                }
                .ql-container.ql-snow {
                    border-color: rgb(63 63 70);
                    border-radius: 0 0 0.75rem 0.75rem;
                    min-height: 400px;
                }
                .ql-editor {
                    min-height: 400px;
                    font-size: 16px;
                    color: white;
                }
                .ql-editor.ql-blank::before {
                    color: rgb(113 113 122);
                    font-style: normal;
                }
                .ql-snow .ql-stroke {
                    stroke: rgb(161 161 170);
                }
                .ql-snow .ql-fill {
                    fill: rgb(161 161 170);
                }
                .ql-snow .ql-picker {
                    color: rgb(161 161 170);
                }
                .ql-snow .ql-picker-label:hover,
                .ql-snow button:hover {
                    color: white !important;
                }
                .ql-snow button:hover .ql-stroke {
                    stroke: white !important;
                }
                .ql-snow .ql-picker-options {
                    background: rgb(39 39 42);
                    border-color: rgb(63 63 70);
                }
                .ql-snow .ql-picker-item:hover {
                    color: white;
                }
                .ql-editor img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1rem 0;
                }
                .ql-editor iframe {
                    max-width: 100%;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    );
};

export default BlogEditor;
