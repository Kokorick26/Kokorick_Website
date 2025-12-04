import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Clock,
    ArrowLeft,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    ChevronRight,
    Tag as TagIcon
} from 'lucide-react';
import { Footer } from './components/Footer';
import { toast } from 'sonner';

const API_BASE = '/api';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    coverImageAlt?: string;
    tags: string[];
    category?: string;
    metaTitle?: string;
    metaDescription?: string;
    status: 'draft' | 'published';
    publishedAt: string;
    authorId: string;
    featured?: boolean;
    viewCount?: number;
    readingTime?: number;
}

interface RelatedBlog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    category?: string;
    publishedAt: string;
    readingTime?: number;
}

interface BlogDetailPageProps {
    slug: string;
    onBack: () => void;
    onBlogClick: (slug: string) => void;
}

export default function BlogDetailPage({ slug, onBack, onBlogClick }: BlogDetailPageProps) {
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBlog();
        fetchRelatedBlogs();
        window.scrollTo(0, 0);
    }, [slug]);

    const fetchBlog = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/blogs/${slug}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setError('Blog post not found');
                } else {
                    throw new Error('Failed to fetch blog');
                }
                return;
            }
            const data = await res.json();
            setBlog(data);
            
            // Update page title
            document.title = `${data.title} | Kokorick Blog`;
        } catch (err) {
            console.error('Error fetching blog:', err);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async () => {
        try {
            const res = await fetch(`${API_BASE}/blogs`);
            if (!res.ok) return;
            const data = await res.json();
            // Get up to 3 related blogs (excluding current)
            const related = data
                .filter((b: RelatedBlog) => b.slug !== slug)
                .slice(0, 3);
            setRelatedBlogs(related);
        } catch (err) {
            console.error('Error fetching related blogs:', err);
        }
    };

    const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
        const url = window.location.href;
        const title = blog?.title || '';

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                try {
                    await navigator.clipboard.writeText(url);
                    toast.success('Link copied to clipboard');
                } catch (err) {
                    toast.error('Failed to copy link');
                }
                break;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-zinc-800 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading article...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TagIcon className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{error || 'Blog not found'}</h2>
                    <p className="text-zinc-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 lg:pt-28 overflow-x-hidden">
            {/* Hero */}
            <section className="relative py-12 lg:py-16">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        {/* Category & Date */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            {blog.category && (
                                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm capitalize">
                                    {blog.category}
                                </span>
                            )}
                            <span className="text-zinc-500">•</span>
                            <span className="text-sm text-zinc-400">
                                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Excerpt */}
                        <p className="text-lg text-zinc-400 mb-8">
                            {blog.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 mb-6">
                            <span className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {blog.authorId?.substring(0, 2).toUpperCase() || 'AD'}
                                </div>
                                {blog.authorId || 'Admin'}
                            </span>
                            {blog.readingTime && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {blog.readingTime} min read
                                </span>
                            )}
                        </div>

                        {/* Share Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-sm text-zinc-500">Share:</span>
                            <button
                                onClick={() => handleShare('twitter')}
                                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                                title="Share on Twitter"
                            >
                                <Twitter className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                                onClick={() => handleShare('linkedin')}
                                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                                title="Share on LinkedIn"
                            >
                                <Linkedin className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                                onClick={() => handleShare('copy')}
                                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                                title="Copy link"
                            >
                                <LinkIcon className="w-4 h-4 text-zinc-400" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Cover Image */}
            {blog.coverImage && (
                <section className="pb-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-5xl mx-auto"
                        >
                            <img
                                src={blog.coverImage}
                                alt={blog.coverImageAlt || blog.title}
                                className="w-full h-auto rounded-2xl border border-zinc-800"
                            />
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="pb-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-3xl mx-auto prose prose-invert prose-lg prose-headings:font-bold prose-headings:text-white prose-p:text-zinc-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-blue-400 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-blockquote:border-l-blue-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-img:rounded-xl prose-img:border prose-img:border-zinc-800"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </div>
            </section>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
                <section className="pb-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-zinc-500 mr-2">Tags:</span>
                                {blog.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-sm hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Related Posts */}
            {relatedBlogs.length > 0 && (
                <section className="pb-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                {relatedBlogs.map((related) => (
                                    <motion.article
                                        key={related.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => onBlogClick(related.slug)}
                                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer group hover:border-zinc-700 transition-all"
                                    >
                                        {related.coverImage ? (
                                            <div className="h-32 overflow-hidden">
                                                <img
                                                    src={related.coverImage}
                                                    alt={related.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-medium mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                                <span>
                                                    {new Date(related.publishedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <Footer />

            {/* Prose Styles */}
            <style>{`
                .prose img {
                    margin-left: auto;
                    margin-right: auto;
                }
                .prose iframe {
                    width: 100%;
                    aspect-ratio: 16/9;
                    border-radius: 0.75rem;
                    border: 1px solid rgb(39 39 42);
                }
                .prose h1, .prose h2, .prose h3, .prose h4 {
                    margin-top: 2em;
                    margin-bottom: 0.5em;
                }
                .prose h1:first-child, .prose h2:first-child {
                    margin-top: 0;
                }
                .prose ul, .prose ol {
                    padding-left: 1.5em;
                }
                .prose li {
                    margin: 0.5em 0;
                }
            `}</style>
        </div>
    );
}
