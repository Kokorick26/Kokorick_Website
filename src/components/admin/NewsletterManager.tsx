import { useState, useEffect } from 'react';
import { Trash2, Mail, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = '/api';

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

export default function NewsletterManager() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/newsletter`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this subscriber?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`${API_BASE}/newsletter/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubscribers(prev => prev.filter(s => s.id !== id));
            toast.success('Subscriber removed');
        } catch (err) {
            toast.error('Failed to remove subscriber');
        }
    };

    const copyAllEmails = async () => {
        const emails = subscribers.map(s => s.email).join(', ');
        await navigator.clipboard.writeText(emails);
        setCopied(true);
        toast.success('Emails copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Newsletter Subscribers</h2>
                    <p className="text-sm text-zinc-400 mt-1">{subscribers.length} subscribers</p>
                </div>
                {subscribers.length > 0 && (
                    <button
                        onClick={copyAllEmails}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy All Emails'}
                    </button>
                )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="text-left text-sm font-medium text-zinc-400 px-6 py-4">Email</th>
                            <th className="text-left text-sm font-medium text-zinc-400 px-6 py-4">Subscribed</th>
                            <th className="text-right text-sm font-medium text-zinc-400 px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                                    No subscribers yet
                                </td>
                            </tr>
                        ) : (
                            subscribers.map(sub => (
                                <tr key={sub.id} className="group hover:bg-zinc-800/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="text-white">{sub.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 text-sm">
                                        {new Date(sub.subscribedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
    );
}
