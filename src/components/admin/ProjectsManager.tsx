import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Link as LinkIcon, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { toast } from "sonner";
import ProjectEditor from "./ProjectEditor";

interface Project {
    id: string;
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

const API_BASE = "/api";

export default function ProjectsManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (!res.ok) throw new Error("Failed to fetch projects");
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load projects. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newProjects = [...projects];
        [newProjects[index - 1], newProjects[index]] = [newProjects[index], newProjects[index - 1]];
        setProjects(newProjects);
        await saveOrder(newProjects);
    };

    const handleMoveDown = async (index: number) => {
        if (index === projects.length - 1) return;
        const newProjects = [...projects];
        [newProjects[index], newProjects[index + 1]] = [newProjects[index + 1], newProjects[index]];
        setProjects(newProjects);
        await saveOrder(newProjects);
    };

    const saveOrder = async (orderedProjects: Project[]) => {
        try {
            const orders = orderedProjects.map((p, idx) => ({ id: p.id, order: idx + 1 }));
            const res = await fetch(`${API_BASE}/projects/reorder/bulk`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orders })
            });
            if (!res.ok) throw new Error("Failed to save order");
            toast.success("Project order updated");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update order");
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setIsEditing(true);
    };

    const handleNewProject = () => {
        setEditingProject(null);
        setIsEditing(true);
    };

    if (isEditing) {
        return (
            <ProjectEditor
                editProject={editingProject || undefined}
                onSuccess={() => {
                    setIsEditing(false);
                    setEditingProject(null);
                    fetchProjects();
                }}
                onCancel={() => {
                    setIsEditing(false);
                    setEditingProject(null);
                }}
            />
        );
    }



    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Projects</h2>
                    <p className="text-sm text-zinc-400 mt-1">Manage your portfolio projects</p>
                </div>
                <button
                    onClick={handleNewProject}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl transition-colors font-bold"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>

                    {/* Table View */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="px-3 py-4 font-medium w-[60px] text-center">Order</th>
                                        <th className="px-6 py-4 font-medium w-[100px]">Image</th>
                                        <th className="px-6 py-4 font-medium">Project Details</th>
                                        <th className="px-6 py-4 font-medium w-[200px]">Tags</th>
                                        <th className="px-6 py-4 font-medium w-[100px] text-center">Featured</th>
                                        <th className="px-6 py-4 font-medium w-[100px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Loading...</td></tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <p className="text-red-400 mb-2">{error}</p>
                                                <button onClick={fetchProjects} className="text-blue-400 hover:underline">Retry</button>
                                            </td>
                                        </tr>
                                    ) : projects.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                                No projects found. Add one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        projects.map((project, index) => (
                                            <tr key={project.id} className="group hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-3 py-4 align-middle">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <button
                                                            onClick={() => handleMoveUp(index)}
                                                            disabled={index === 0}
                                                            className={`p-1 rounded hover:bg-zinc-700 transition-colors ${index === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
                                                            title="Move up"
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-xs text-zinc-500 font-mono">{index + 1}</span>
                                                        <button
                                                            onClick={() => handleMoveDown(index)}
                                                            disabled={index === projects.length - 1}
                                                            className={`p-1 rounded hover:bg-zinc-700 transition-colors ${index === projects.length - 1 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
                                                            title="Move down"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="w-16 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                                                        <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <h3 className="text-white font-medium text-sm mb-1">{project.title}</h3>
                                                    <p className="text-zinc-400 text-xs line-clamp-2 max-w-md">{project.description}</p>
                                                    {project.link && (
                                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs mt-1.5">
                                                            <LinkIcon className="w-3 h-3" />
                                                            {new URL(project.link).hostname}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {project.tags.slice(0, 4).map(tag => (
                                                            <span key={tag} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded border border-zinc-700 whitespace-nowrap">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {project.tags.length > 4 && (
                                                            <span className="px-1.5 py-0.5 text-zinc-500 text-[10px]">+ {project.tags.length - 4}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-top text-center">
                                                    {project.featured ? (
                                                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" title="Featured"></span>
                                                    ) : (
                                                        <span className="inline-block w-2 h-2 rounded-full bg-zinc-700" title="Not Featured"></span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 align-top text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditProject(project)}
                                                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDelete(e, project.id)}
                                                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                                                            title="Delete"
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
