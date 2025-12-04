import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
    Loader2, 
    Save, 
    ArrowLeft,
    Layout,
    FileText,
    Settings,
    Youtube,
    X,
    Plus
} from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';

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
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
};

const isImageUrl = (url: string): boolean => {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
};

// Upload image to S3
const uploadImageToS3 = async (file: File, folder: string = 'project-content'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    try {
        const res = await fetch(`${API_BASE}/upload/image`, {
            method: 'POST',
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

interface Project {
    id?: string;
    title: string;
    description: string;
    fullDescription?: string;
    impact?: string;
    challenges?: string[];
    results?: string[];
    imageUrl: string;
    link?: string;
    tags: string[];
    featured: boolean;
    order?: number;
}

interface ProjectEditorProps {
    onSuccess: () => void;
    onCancel: () => void;
    editProject?: Project;
}

export default function ProjectEditor({ onSuccess, onCancel, editProject }: ProjectEditorProps) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'settings'>('basic');
    const quillRef = useRef<ReactQuill>(null);

    // Basic Info
    const [title, setTitle] = useState(editProject?.title || '');
    const [description, setDescription] = useState(editProject?.description || '');
    const [imageUrl, setImageUrl] = useState(editProject?.imageUrl || '');
    const [link, setLink] = useState(editProject?.link || '');
    const [tags, setTags] = useState<string[]>(editProject?.tags || []);
    const [tagInput, setTagInput] = useState('');

    // Content
    const [fullDescription, setFullDescription] = useState(editProject?.fullDescription || '');
    const [impact, setImpact] = useState(editProject?.impact || '');
    const [challenges, setChallenges] = useState<string[]>(editProject?.challenges || []);
    const [results, setResults] = useState<string[]>(editProject?.results || []);
    const [challengeInput, setChallengeInput] = useState('');
    const [resultInput, setResultInput] = useState('');

    // Settings
    const [featured, setFeatured] = useState(editProject?.featured || false);
    const [order, setOrder] = useState(editProject?.order || 999);


    // Handle paste events for images and URLs
    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        // Check for pasted images
        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    toast.loading('Uploading pasted image...');
                    const url = await uploadImageToS3(file, 'project-content');
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

        // Check for pasted URLs
        const pastedText = clipboardData.getData('text/plain').trim();
        if (pastedText && /^https?:\/\//i.test(pastedText)) {
            if (isYouTubeUrl(pastedText)) {
                e.preventDefault();
                const embedUrl = getYouTubeEmbedUrl(pastedText);
                if (embedUrl) {
                    const range = quill.getSelection() || { index: quill.getLength() };
                    quill.insertEmbed(range.index, 'video', embedUrl);
                    quill.setSelection(range.index + 1, 0);
                    toast.success('YouTube video embedded');
                }
            } else if (isImageUrl(pastedText)) {
                e.preventDefault();
                const range = quill.getSelection() || { index: quill.getLength() };
                quill.insertEmbed(range.index, 'image', pastedText);
                quill.setSelection(range.index + 1, 0);
                toast.success('Image added');
            }
        }
    }, []);

    // Attach paste handler
    useEffect(() => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const editorElement = quill.root;
            const pasteHandler = handlePaste as unknown as EventListener;
            editorElement.addEventListener('paste', pasteHandler);
            return () => editorElement.removeEventListener('paste', pasteHandler);
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
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: function() {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files ? input.files[0] : null;
                        if (file) {
                            try {
                                toast.loading('Uploading image...');
                                const formData = new FormData();
                                formData.append('image', file);
                                formData.append('folder', 'project-content');

                                const res = await fetch(`${API_BASE}/upload/image`, {
                                    method: 'POST',
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
                                toast.dismiss();
                                toast.error('Failed to upload image');
                            }
                        }
                    };
                },
                video: function() {
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
        clipboard: { matchVisual: false }
    }), []);

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

    const handleAddChallenge = () => {
        if (challengeInput.trim()) {
            setChallenges([...challenges, challengeInput.trim()]);
            setChallengeInput('');
        }
    };

    const handleAddResult = () => {
        if (resultInput.trim()) {
            setResults([...results, resultInput.trim()]);
            setResultInput('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Short description is required');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(editProject?.id ? 'Updating project...' : 'Creating project...');

        try {
            const projectData = {
                title,
                description,
                fullDescription,
                impact,
                challenges,
                results,
                imageUrl,
                link,
                tags,
                featured,
                order
            };

            const url = editProject?.id
                ? `${API_BASE}/projects/${editProject.id}`
                : `${API_BASE}/projects`;

            const method = editProject?.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });

            if (!res.ok) throw new Error('Failed to save project');

            toast.dismiss(loadingToast);
            toast.success(editProject?.id ? 'Project updated successfully' : 'Project created successfully');
            onSuccess();
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Layout },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings }
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
                                {editProject?.id ? 'Edit Project' : 'Create New Project'}
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                {editProject?.id ? 'Update your project details' : 'Add a new project to your portfolio'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Project
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === tab.id
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
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Project Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter project title..."
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Project Link</label>
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Short Description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief summary for the project card..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                                        required
                                    />
                                </div>

                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Tags (comma separated)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => handleTagInputChange(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                            placeholder="React, AI, Python..."
                                            className="flex-1 px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map(tag => (
                                                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-sm">
                                                    {tag}
                                                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Cover Image */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-300">Cover Image</label>
                                <ImageUpload
                                    value={imageUrl}
                                    onChange={setImageUrl}
                                    folder="projects"
                                    aspectRatio="video"
                                    placeholder="Upload project cover image"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Editor */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Rich Text Editor for Full Description */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Full Description</label>
                                    <div className="border border-zinc-700 rounded-xl overflow-hidden">
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={fullDescription}
                                            onChange={setFullDescription}
                                            modules={modules}
                                            placeholder="Write detailed project description... Paste images or YouTube URLs to embed them."
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <Youtube className="w-3 h-3" />
                                        Paste YouTube URLs to auto-embed • Paste images to auto-upload
                                    </p>
                                </div>

                                {/* Impact Statement */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-zinc-300">Impact Statement</label>
                                    <input
                                        type="text"
                                        value={impact}
                                        onChange={(e) => setImpact(e.target.value)}
                                        placeholder="e.g. Reduced costs by 30%, Improved efficiency by 50%..."
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-6">
                                {/* Content Stats */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Content Stats</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Words:</span>
                                            <span className="text-white font-medium">
                                                {fullDescription.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Characters:</span>
                                            <span className="text-white font-medium">{fullDescription.length}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Challenges */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Challenges</h3>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={challengeInput}
                                            onChange={(e) => setChallengeInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChallenge())}
                                            placeholder="Add challenge..."
                                            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <button type="button" onClick={handleAddChallenge} className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 text-sm">
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {challenges.map((c, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-zinc-700 rounded-lg">
                                                <span className="text-red-400 text-xs">•</span>
                                                <span className="flex-1 text-xs text-zinc-300">{c}</span>
                                                <X className="w-3 h-3 cursor-pointer text-zinc-500 hover:text-white" onClick={() => setChallenges(challenges.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Results */}
                                <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-zinc-300 mb-3">Key Results</h3>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={resultInput}
                                            onChange={(e) => setResultInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResult())}
                                            placeholder="Add result..."
                                            className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <button type="button" onClick={handleAddResult} className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 text-sm">
                                            Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {results.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2 px-2 py-1 bg-zinc-700 rounded-lg">
                                                <span className="text-green-400 text-xs">✓</span>
                                                <span className="flex-1 text-xs text-zinc-300">{r}</span>
                                                <X className="w-3 h-3 cursor-pointer text-zinc-500 hover:text-white" onClick={() => setResults(results.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                            <div>
                                <h3 className="text-white font-medium">Featured Project</h3>
                                <p className="text-sm text-zinc-500">Highlight this project on the homepage</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={featured}
                                    onChange={(e) => setFeatured(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Display Order</h3>
                                    <p className="text-sm text-zinc-500">Lower numbers appear first (1 = top)</p>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 999)}
                                    className="w-20 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
