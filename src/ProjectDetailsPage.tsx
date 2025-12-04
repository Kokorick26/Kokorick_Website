import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Calendar, Layers, Trophy, Target } from "lucide-react";
import { Footer } from "./components/Footer";

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
    createdAt?: string;
}

interface ProjectDetailsPageProps {
    projectId: string;
    onBack: () => void;
}

export default function ProjectDetailsPage({ projectId, onBack }: ProjectDetailsPageProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app with routing, we'd fetch by ID. 
        // Here we'll fetch all and find the one (or fetch specific if endpoint exists)
        // Assuming /api/projects returns all, we find by ID.
        // If /api/projects/:id exists, use that.
        fetch(`/api/projects`)
            .then(res => res.json())
            .then(data => {
                const found = data.find((p: any) => p.id === projectId);
                if (found) {
                    // Ensure arrays exist
                    setProject({
                        ...found,
                        challenges: found.challenges || [],
                        results: found.results || [],
                        fullDescription: found.fullDescription || found.description
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load project", err);
                setLoading(false);
            });
    }, [projectId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse">Loading Project Details...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <div className="text-2xl">Project not found</div>
                <button onClick={onBack} className="text-blue-400 hover:underline">Back to Projects</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <div className="relative min-h-[60vh] w-full">
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="relative flex flex-col justify-between min-h-[60vh] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={onBack}
                        className="mt-32 self-start flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Projects</span>
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pb-20 pt-12"
                    >
                        <div className="flex flex-wrap gap-3 mb-6">
                            {project.tags.map((tag, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm backdrop-blur-sm"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight break-words">
                            {project.title}
                        </h1>
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors"
                            >
                                Visit Project <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Layers className="w-8 h-8 text-blue-400" />
                                Overview
                            </h2>
                            <div
                                className="prose prose-invert prose-lg max-w-none text-zinc-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: project.fullDescription || project.description }}
                            />
                        </motion.section>

                        {project.challenges && project.challenges.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    <Target className="w-8 h-8 text-red-400" />
                                    The Challenge
                                </h2>
                                <ul className="grid gap-4">
                                    {project.challenges.map((challenge, i) => (
                                        <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mt-0.5">
                                                {i + 1}
                                            </span>
                                            <span className="text-zinc-300">{challenge}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.section>
                        )}

                        {project.results && project.results.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                <h2 className="text-3xl font-bold flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-yellow-400" />
                                    Key Results
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {project.results.map((result, i) => (
                                        <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 flex items-center gap-4">
                                            <div className="w-2 h-12 rounded-full bg-yellow-500/50" />
                                            <span className="text-lg font-medium text-white">{result}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm sticky top-32"
                        >
                            <h3 className="text-xl font-bold mb-6">Project Info</h3>

                            <div className="space-y-6">
                                {project.impact && (
                                    <div>
                                        <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2">Impact</div>
                                        <p className="text-blue-400 font-medium text-lg">{project.impact}</p>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2">Technologies</div>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-zinc-300 bg-zinc-800 px-2 py-1 rounded text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {project.createdAt && (
                                    <div>
                                        <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2">Date</div>
                                        <div className="flex items-center gap-2 text-zinc-300">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
