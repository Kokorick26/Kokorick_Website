import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Calendar,
    Clock,
    Tag,
    Search,
    ChevronRight,
    ArrowRight,
    Star
} from 'lucide-react';
import { Footer } from './components/Footer';

const API_BASE = '/api';

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    tags: string[];
    category?: string;
    status: 'draft' | 'published';
    publishedAt: string;
    authorId: string;
    featured?: boolean;
    viewCount?: number;
    readingTime?: number;
}

interface BlogPageProps {
    onBlogClick: (slug: string) => void;
}

export default function BlogPage({ onBlogClick }: BlogPageProps) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch(`${API_BASE}/blogs`);
            if (!res.ok) throw new Error('Failed to fetch blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || blog.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredBlog = blogs.find(b => b.featured);
    // Exclude featured blog from grid when featured section is visible (no search/filter)
    const showFeaturedSection = featuredBlog && !searchQuery && !selectedCategory;
    const regularBlogs = showFeaturedSection
        ? filteredBlogs.filter(b => b.id !== featuredBlog?.id)
        : filteredBlogs;

    const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))];

    return (
        <div className="min-h-screen bg-black text-white pt-24 lg:pt-28">
            {/* Hero Section */}
            <section className="relative pt-16 pb-12 lg:pt-20 lg:pb-16 overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight">
                            Blog
                        </h1>
                        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
                            Insights, tutorials, and updates from our team.
                        </p>

                        {/* Search */}
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="py-6 border-b border-zinc-900">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    !selectedCategory
                                        ? 'bg-white text-black'
                                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category || null)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                        selectedCategory === category
                                            ? 'bg-white text-black'
                                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Post */}
            {featuredBlog && !searchQuery && !selectedCategory && (
                <section className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            onClick={() => onBlogClick(featuredBlog.slug)}
                            className="relative bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer group hover:border-zinc-700 transition-all duration-300"
                        >
                            <div className="grid lg:grid-cols-2 gap-0">
                                {featuredBlog.coverImage && (
                                    <div className="relative h-64 lg:h-80 overflow-hidden">
                                        <img
                                            src={featuredBlog.coverImage}
                                            alt={featuredBlog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <div className="p-8 lg:p-10 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium">
                                            <Star className="w-3 h-3 fill-current" />
                                            Featured
                                        </span>
                                        {featuredBlog.category && (
                                            <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-xs capitalize">
                                                {featuredBlog.category}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                                        {featuredBlog.title}
                                    </h2>
                                    <p className="text-zinc-400 mb-6 line-clamp-3">
                                        {featuredBlog.excerpt}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        {featuredBlog.readingTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {featuredBlog.readingTime} min read
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-6">
                                        <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
                                            Read Article <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Blog Grid */}
            <section className="pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                                    <div className="h-48 bg-zinc-800" />
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-zinc-800 rounded w-1/4" />
                                        <div className="h-6 bg-zinc-800 rounded w-3/4" />
                                        <div className="h-4 bg-zinc-800 rounded" />
                                        <div className="h-4 bg-zinc-800 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : regularBlogs.length === 0 && !showFeaturedSection ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-medium mb-2">No articles found</h3>
                            <p className="text-zinc-500">
                                {searchQuery || selectedCategory
                                    ? 'Try adjusting your search or filters'
                                    : 'Check back soon for new content'}
                            </p>
                        </div>
                    ) : regularBlogs.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {regularBlogs.map((blog, index) => (
                                <motion.article
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => onBlogClick(blog.slug)}
                                    className="bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden cursor-pointer group hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
                                >
                                    {blog.coverImage ? (
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                            <Tag className="w-12 h-12 text-zinc-700" />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            {blog.category && (
                                                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded text-xs capitalize">
                                                    {blog.category}
                                                </span>
                                            )}
                                            <span className="text-xs text-zinc-500">
                                                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                            {blog.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-zinc-500">
                                            <div className="flex items-center gap-3">
                                                {blog.readingTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {blog.readingTime} min
                                                    </span>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            <Footer />
        </div>
    );
}
