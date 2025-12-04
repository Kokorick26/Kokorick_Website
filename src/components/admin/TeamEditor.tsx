import { useState } from "react";
import { ArrowLeft, Save, Loader2, Linkedin, Twitter } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";

interface TeamMember {
    id?: string;
    name: string;
    role: string;
    quote: string;
    bio: string;
    image: string;
    linkedin?: string;
    twitter?: string;
    order: number;
    published: boolean;
}

interface TeamEditorProps {
    onSuccess: () => void;
    onCancel: () => void;
    editMember?: TeamMember;
}

const API_BASE = "/api";

export default function TeamEditor({ onSuccess, onCancel, editMember }: TeamEditorProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TeamMember>>(
        editMember || { order: 0, published: true }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.role) {
            toast.error("Name and role are required");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(editMember?.id ? "Updating team member..." : "Creating team member...");

        try {
            const token = localStorage.getItem('adminToken');
            const method = editMember?.id ? "PUT" : "POST";
            const url = editMember?.id
                ? `${API_BASE}/team/${editMember.id}`
                : `${API_BASE}/team`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to save team member");

            toast.dismiss(loadingToast);
            toast.success(editMember?.id ? "Team member updated successfully" : "Team member created successfully");
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error("Failed to save team member");
        } finally {
            setLoading(false);
        }
    };

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
                                {editMember?.id ? 'Edit Team Member' : 'Add New Team Member'}
                            </h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                {editMember?.id ? 'Update team member details' : 'Add a new member to your leadership team'}
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
                        Save Team Member
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Photo */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-zinc-300 mb-3 block">Profile Photo</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(url) => setFormData({ ...formData, image: url })}
                                    folder="team"
                                    aspectRatio="square"
                                    placeholder="Upload Photo"
                                />
                            </div>

                            {/* Settings Card */}
                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold block">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order || 0}
                                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        min="0"
                                    />
                                    <p className="text-xs text-zinc-600 mt-1">Lower numbers appear first</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                                    <div>
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block">Published</label>
                                        <p className="text-xs text-zinc-600 mt-1">Show on website</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.published !== false}
                                            onChange={e => setFormData({ ...formData, published: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Middle & Right Columns - Form Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Name & Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-300">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-300">Role *</label>
                                    <input
                                        type="text"
                                        value={formData.role || ""}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Founder & CEO"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300">Quote</label>
                                <textarea
                                    value={formData.quote || ""}
                                    onChange={e => setFormData({ ...formData, quote: e.target.value })}
                                    className="w-full text-sm text-zinc-100 bg-zinc-800/40 border border-zinc-700 rounded-xl p-4 leading-relaxed focus:outline-none focus:border-blue-500 transition-all resize-none"
                                    rows={2}
                                    placeholder="A memorable quote from this team member..."
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300">Bio</label>
                                <textarea
                                    value={formData.bio || ""}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full text-sm text-zinc-100 bg-zinc-800/40 border border-zinc-700 rounded-xl p-4 leading-relaxed focus:outline-none focus:border-blue-500 transition-all resize-none min-h-[120px]"
                                    placeholder="Brief professional background and expertise..."
                                />
                            </div>

                            {/* Social Links */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-300 mb-3 block">Social Links</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-3 bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/50">
                                        <Linkedin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={formData.linkedin || ""}
                                            onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                            className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/50">
                                        <Twitter className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={formData.twitter || ""}
                                            onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                                            className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none"
                                            placeholder="https://twitter.com/username"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
