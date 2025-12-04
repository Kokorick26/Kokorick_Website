import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Save, Loader2, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = '/api';

interface Whitepaper {
    id: string;
    title: string;
    pdfUrl: string;
    downloadCount: number;
}

export default function WhitepapersManager() {
    const [whitepaper, setWhitepaper] = useState<Whitepaper | null>(null);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchWhitepaper();
    }, []);

    const fetchWhitepaper = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/whitepapers/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setWhitepaper(data[0]);
                    setTitle(data[0].title);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error('Name is required');
            return;
        }
        if (!whitepaper && !selectedFile) {
            toast.error('PDF file is required');
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', '');
        formData.append('category', 'general');
        formData.append('published', 'true');
        if (selectedFile) {
            formData.append('pdf', selectedFile);
        }

        try {
            const token = localStorage.getItem('adminToken');
            const url = whitepaper
                ? `${API_BASE}/whitepapers/${whitepaper.id}`
                : `${API_BASE}/whitepapers`;
            const method = whitepaper ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Failed to save');
            const saved = await res.json();
            setWhitepaper(saved);
            setSelectedFile(null);
            toast.success('Whitepaper saved');
        } catch (err) {
            toast.error('Failed to save whitepaper');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!whitepaper) return;
        if (!confirm('Delete this whitepaper?')) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`${API_BASE}/whitepapers/${whitepaper.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setWhitepaper(null);
            setTitle('');
            setSelectedFile(null);
            toast.success('Whitepaper deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h2 className="text-2xl font-bold text-white">Whitepaper</h2>
                <p className="text-sm text-zinc-400 mt-1">Upload the downloadable whitepaper</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Name *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            placeholder="Whitepaper name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">PDF File {!whitepaper && '*'}</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-zinc-600 transition-colors"
                        >
                            <Upload className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
                            {selectedFile ? (
                                <p className="text-blue-400 font-medium">{selectedFile.name}</p>
                            ) : whitepaper?.pdfUrl ? (
                                <p className="text-zinc-400">Current file uploaded. Click to replace.</p>
                            ) : (
                                <p className="text-zinc-500">Click to upload PDF</p>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    {whitepaper && (
                        <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">{whitepaper.title}</p>
                                <p className="text-sm text-zinc-500">{whitepaper.downloadCount || 0} downloads</p>
                            </div>
                            <a
                                href={whitepaper.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                        {whitepaper && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-6 py-3 text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
