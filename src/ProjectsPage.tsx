import { motion } from "motion/react";
import { Footer } from "./components/Footer";
import {
  Sparkles,
  ExternalLink,
  Github,
  Brain,
  MessageSquare,
  Database,
  Workflow,
  TrendingUp,
  Shield
} from "lucide-react";

function AnimatedSection({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProjectsHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-black to-purple-950/30" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-[5]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-64 sm:pt-80 pb-20 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">Our Work</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-white/90 leading-tight font-medium"
        >
          AI systems that deliver
          <span className="block mt-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            measurable results
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl mx-auto text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed mb-12"
        >
          Explore our portfolio of production AI systems across industries
        </motion.p>
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  const projects = [
    {
      title: "Enterprise RAG Platform",
      category: "Knowledge Management",
      description: "Built a scalable RAG system processing 10M+ documents with sub-second query times for a Fortune 500 company.",
      icon: Database,
      tags: ["LangChain", "Pinecone", "GPT-4", "FastAPI"],
      metrics: [
        { label: "Documents", value: "10M+" },
        { label: "Query Time", value: "<500ms" },
        { label: "Accuracy", value: "94%" }
      ],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Customer Support Agent",
      category: "Conversational AI",
      description: "Autonomous support agent handling 80% of customer inquiries with human-level quality and satisfaction.",
      icon: MessageSquare,
      tags: ["OpenAI", "React", "Node.js", "PostgreSQL"],
      metrics: [
        { label: "Automation", value: "80%" },
        { label: "CSAT Score", value: "4.8/5" },
        { label: "Response Time", value: "2s" }
      ],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Multi-Agent Research System",
      category: "Agentic AI",
      description: "Coordinated agent system for automated research, analysis, and report generation across multiple data sources.",
      icon: Workflow,
      tags: ["AutoGPT", "LangGraph", "Python", "Redis"],
      metrics: [
        { label: "Agents", value: "12" },
        { label: "Sources", value: "50+" },
        { label: "Time Saved", value: "90%" }
      ],
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Predictive Analytics Engine",
      category: "Machine Learning",
      description: "Custom ML models for demand forecasting with 95% accuracy, optimizing inventory and reducing costs.",
      icon: TrendingUp,
      tags: ["PyTorch", "Scikit-learn", "MLflow", "AWS"],
      metrics: [
        { label: "Accuracy", value: "95%" },
        { label: "Cost Savings", value: "$2M/yr" },
        { label: "Predictions", value: "1M+/day" }
      ],
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "AI Content Moderation",
      category: "Safety & Trust",
      description: "Real-time content moderation system using custom fine-tuned models for multi-modal content analysis.",
      icon: Shield,
      tags: ["CLIP", "BERT", "FastAPI", "Kubernetes"],
      metrics: [
        { label: "Throughput", value: "10K/s" },
        { label: "Precision", value: "98%" },
        { label: "Latency", value: "<100ms" }
      ],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Neural Code Assistant",
      category: "Developer Tools",
      description: "AI-powered code completion and refactoring tool trained on proprietary codebase patterns.",
      icon: Brain,
      tags: ["CodeLlama", "VSCode API", "TypeScript"],
      metrics: [
        { label: "Adoption", value: "95%" },
        { label: "Time Saved", value: "30%" },
        { label: "Accuracy", value: "92%" }
      ],
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <>
      <ProjectsHero />

      {/* Projects Grid */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-medium">
                Featured Projects
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Real-world AI systems delivering value in production
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group"
              >
                <div className="h-full p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
                      <project.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <ExternalLink className="w-5 h-5 text-white/60" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <Github className="w-5 h-5 text-white/60" />
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-4">
                    {project.category}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl text-white font-medium mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-white/5">
                    {project.metrics.map((metric, j) => (
                      <div key={j} className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                        <div className="text-xs text-white/50">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/60 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study CTA */}
      <AnimatedSection>
        <section className="bg-black py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 backdrop-blur-sm">
              <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl text-white mb-4 font-medium">
                Want to see detailed case studies?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Get in-depth technical breakdowns, architecture diagrams, and lessons learned from our projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Download case studies
                </motion.button>
                <motion.button
                  className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule a demo
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </>
  );
}
