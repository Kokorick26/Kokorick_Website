import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, X, Search, Save } from "lucide-react";
import ImageUpload from "./ImageUpload";

interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    avatarUrl?: string;
    companyLogoUrl?: string;
}

const API_BASE = "/api";

export default function TestimonialsManager() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Partial<Testimonial>>({});
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch(`${API_BASE}/reviews`);
            if (!res.ok) throw new Error("Failed to fetch testimonials");
            const data = await res.json();
            setTestimonials(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load testimonials");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this testimonial?")) return;
        try {
            await fetch(`${API_BASE}/reviews/${id}`, { method: "DELETE" });
            setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const method = currentTestimonial.id ? "PUT" : "POST";
            const url = currentTestimonial.id
                ? `${API_BASE}/reviews/${currentTestimonial.id}`
                : `${API_BASE}/reviews`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentTestimonial)
            });

            if (!res.ok) throw new Error("Failed to save testimonial");

            const saved = await res.json();

            if (currentTestimonial.id) {
                setTestimonials(prev => prev.map(t => t.id === saved.id ? saved : t));
            } else {
                setTestimonials(prev => [...prev, saved]);
            }

            setIsEditing(false);
            setCurrentTestimonial({});
        } catch (err) {
            setError("Failed to save testimonial");
            console.error(err);
        }
    };



    return (
        <>
            <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Testimonials</h2>
                    <button
                        onClick={() => {
                            setCurrentTestimonial({});
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl transition-colors font-bold shadow-lg shadow-white/10"
                    >
                        <Plus className="w-4 h-4" />
                        Add Testimonial
                    </button>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900">
                                    <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[30%]">Author</th>
                                    <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[20%]">Role & Company</th>
                                    <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[35%]">Content</th>
                                    <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="px-8 py-16 text-left text-zinc-50">Loading...</td></tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-16 text-center text-red-400">
                                            {error}
                                            <button onClick={fetchTestimonials} className="ml-4 underline hover:text-red-300">Retry</button>
                                        </td>
                                    </tr>
                                ) : testimonials.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-24 text-center">
                                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-400 font-medium">No testimonials found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    testimonials.map(testimonial => (
                                        <tr key={testimonial.id} className="hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {testimonial.avatarUrl ? (
                                                            <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-zinc-500">{testimonial.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-white">{testimonial.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-zinc-300">{testimonial.role}</span>
                                                    <span className="text-xs text-zinc-500">{testimonial.company}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <p className="text-sm text-zinc-400 line-clamp-2">{testimonial.content}</p>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentTestimonial(testimonial);
                                                            setIsEditing(true);
                                                        }}
                                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(testimonial.id);
                                                        }}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsEditing(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-white shadow-2xl shadow-black/50"
                        >
                            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur px-6 py-4 border-b border-zinc-800 flex items-center justify-between z-10">
                                <h3 className="text-xl font-bold">
                                    {currentTestimonial.id ? "Edit Testimonial" : "New Testimonial"}
                                </h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                <form onSubmit={handleSave} className="space-y-8">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    {/* Top Section: Avatar & Name */}
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="shrink-0">
                                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Avatar</label>
                                            <ImageUpload
                                                value={currentTestimonial.avatarUrl}
                                                onChange={(url) => setCurrentTestimonial({ ...currentTestimonial, avatarUrl: url })}
                                                folder="avatars"
                                                aspectRatio="square"
                                                placeholder="Upload Avatar"
                                                className="w-32"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</label>
                                                <input
                                                    type="text"
                                                    value={currentTestimonial.name || ""}
                                                    onChange={e => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                                                    className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors pb-1"
                                                    placeholder="Enter name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Or enter Avatar URL</label>
                                                <input
                                                    type="text"
                                                    value={currentTestimonial.avatarUrl || ""}
                                                    onChange={e => setCurrentTestimonial({ ...currentTestimonial, avatarUrl: e.target.value })}
                                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 transition-colors group">
                                            <label className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold block group-hover:text-zinc-400 transition-colors">Role</label>
                                            <input
                                                type="text"
                                                value={currentTestimonial.role || ""}
                                                onChange={e => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                                                className="w-full bg-transparent font-semibold text-sm text-white placeholder-zinc-600 focus:outline-none"
                                                placeholder="e.g. CTO"
                                                required
                                            />
                                        </div>
                                        <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 rounded-xl border border-zinc-800/60 hover:border-zinc-700/60 transition-colors group">
                                            <label className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold block group-hover:text-zinc-400 transition-colors">Company</label>
                                            <input
                                                type="text"
                                                value={currentTestimonial.company || ""}
                                                onChange={e => setCurrentTestimonial({ ...currentTestimonial, company: e.target.value })}
                                                className="w-full bg-transparent font-semibold text-sm text-white placeholder-zinc-600 focus:outline-none"
                                                placeholder="e.g. Tech Corp"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-full">
                                        <label className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider block">Testimonial Content</label>
                                        <textarea
                                            value={currentTestimonial.content || ""}
                                            onChange={e => setCurrentTestimonial({ ...currentTestimonial, content: e.target.value })}
                                            className="w-full text-sm text-zinc-100 bg-zinc-800/40 border border-zinc-800/80 rounded-xl p-6 leading-relaxed shadow-inner focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none min-h-[200px]"
                                            required
                                            placeholder="Testimonial content..."
                                        />
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 text-zinc-400 hover:text-white transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-white/10"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Testimonial
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
