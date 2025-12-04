import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Users, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import TeamEditor from "./TeamEditor";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    quote: string;
    bio: string;
    image: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    order: number;
    published: boolean;
}

const API_BASE = "/api";

export default function TeamManager() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEditing) {
            fetchMembers();
        }
    }, [isEditing]);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/team/admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Failed to fetch team members");
            const data = await res.json();
            setMembers(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load team members");
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this team member?")) return;

        const loadingToast = toast.loading("Deleting team member...");
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`${API_BASE}/team/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMembers(prev => prev.filter(m => m.id !== id));
            toast.dismiss(loadingToast);
            toast.success("Team member deleted successfully");
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error("Failed to delete team member");
        }
    };

    const togglePublished = async (member: TeamMember) => {
        const loadingToast = toast.loading("Updating visibility...");
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_BASE}/team/${member.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...member, published: !member.published })
            });

            if (!res.ok) throw new Error("Failed to update");
            const updated = await res.json();
            setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
            toast.dismiss(loadingToast);
            toast.success(updated.published ? "Team member published" : "Team member hidden");
        } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error("Failed to update visibility");
        }
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setEditingMember(undefined);
        setIsEditing(true);
    };

    const handleSuccess = () => {
        setIsEditing(false);
        setEditingMember(undefined);
        fetchMembers();
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingMember(undefined);
    };

    // Show editor if editing
    if (isEditing) {
        return <TeamEditor onSuccess={handleSuccess} onCancel={handleCancel} editMember={editingMember} />;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Leadership Team</h2>
                    <p className="text-sm text-zinc-400 mt-1">Manage your team members</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl transition-colors font-bold shadow-lg shadow-white/10"
                >
                    <Plus className="w-4 h-4" />
                    Add Team Member
                </button>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900">
                                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[5%]">Order</th>
                                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[30%]">Member</th>
                                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[20%]">Role</th>
                                <th className="text-left text-sm font-bold text-zinc-400 px-6 py-6 w-[30%]">Quote</th>
                                <th className="text-center text-sm font-bold text-zinc-400 px-6 py-6 w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-8 py-16 text-center text-zinc-50">Loading...</td></tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-red-400">
                                        {error}
                                        <button onClick={fetchMembers} className="ml-4 underline hover:text-red-300">Retry</button>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-zinc-600" />
                                        </div>
                                        <p className="text-zinc-400 font-medium">No team members found</p>
                                        <button
                                            onClick={handleAdd}
                                            className="mt-4 text-blue-400 hover:underline"
                                        >
                                            Add your first team member
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                members.map(member => (
                                    <tr key={member.id} className="hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-8">
                                            <span className="text-zinc-400 font-mono text-sm">{member.order}</span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-zinc-500">{member.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">{member.name}</span>
                                                    {!member.published && (
                                                        <span className="text-xs text-yellow-500">Hidden</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className="text-sm text-zinc-300">{member.role}</span>
                                        </td>
                                        <td className="px-6 py-8">
                                            <p className="text-sm text-zinc-400 line-clamp-2 italic">"{member.quote}"</p>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => togglePublished(member)}
                                                    className={`p-2 rounded-lg transition-colors ${member.published
                                                        ? 'text-green-400 hover:bg-green-500/10'
                                                        : 'text-zinc-400 hover:bg-zinc-700'
                                                        }`}
                                                    title={member.published ? "Hide from public" : "Show to public"}
                                                >
                                                    {member.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(member)}
                                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
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
    );
}
