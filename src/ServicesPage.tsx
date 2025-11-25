import { motion } from "motion/react";
import { Footer } from "./components/Footer";
import {
  Brain,
  Code2,
  Rocket,
  Shield,
  Zap,
  Database,
  GitBranch,
  Sparkles,
  CheckCircle2,
  ArrowRight
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

function ServicesHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black to-blue-950/30" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-[5]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-64 sm:pt-80 pb-20 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Our Services</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-white/90 leading-tight font-medium"
        >
          Build AI systems that
          <span className="block mt-3 bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            actually work in production
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl mx-auto text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed mb-12"
        >
          From research prototypes to enterprise-grade AI platforms, we handle the full stack.
        </motion.p>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const services = [
    {
      icon: Brain,
      title: "AI Research & Development",
      description: "Custom AI models, fine-tuning, and research implementation tailored to your domain.",
      features: [
        "Custom model development",
        "LLM fine-tuning & optimization",
        "Research paper implementation",
        "Algorithm design & prototyping"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code2,
      title: "Full-Stack AI Engineering",
      description: "End-to-end development of AI-powered applications with modern tech stacks.",
      features: [
        "React/Next.js frontends",
        "Python/Node.js backends",
        "API design & integration",
        "Database architecture"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Rocket,
      title: "Agentic AI Systems",
      description: "Build autonomous agents that reason, plan, and execute complex workflows.",
      features: [
        "Multi-agent orchestration",
        "Tool integration & function calling",
        "Memory & context management",
        "Workflow automation"
      ],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Database,
      title: "RAG & Knowledge Systems",
      description: "Retrieval-augmented generation systems for enterprise knowledge bases.",
      features: [
        "Vector database setup",
        "Semantic search optimization",
        "Document processing pipelines",
        "Context-aware retrieval"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "AI Safety & Evaluation",
      description: "Ensure your AI systems are reliable, safe, and production-ready.",
      features: [
        "Model evaluation frameworks",
        "Safety guardrails",
        "Bias detection & mitigation",
        "Performance monitoring"
      ],
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: GitBranch,
      title: "MLOps & Infrastructure",
      description: "Deploy, monitor, and scale AI systems with modern DevOps practices.",
      features: [
        "CI/CD pipelines",
        "Model versioning & tracking",
        "Cloud deployment (AWS/GCP/Azure)",
        "Performance optimization"
      ],
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <>
      <ServicesHero />

      {/* Services Grid */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-medium">
                Comprehensive AI Solutions
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Everything you need to build, deploy, and scale intelligent systems
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group"
              >
                <div className="h-full p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/8 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl text-white font-medium mb-3">{service.title}</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">{service.description}</p>

                  <ul className="space-y-3">
                    {service.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-white/60">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-medium">
                Our Process
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                From concept to deployment in four streamlined phases
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "Understand your needs and define success metrics" },
              { step: "02", title: "Design", desc: "Architecture planning and technical specification" },
              { step: "03", title: "Development", desc: "Agile sprints with continuous feedback" },
              { step: "04", title: "Deployment", desc: "Launch, monitor, and iterate for success" }
            ].map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <div className="text-6xl font-bold text-white/10 mb-4">{phase.step}</div>
                  <h3 className="text-2xl text-white font-medium mb-3">{phase.title}</h3>
                  <p className="text-white/60">{phase.desc}</p>
                  {i < 3 && (
                    <ArrowRight className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500/50" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="bg-black py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
              <Zap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl text-white mb-4 font-medium">
                Ready to build something amazing?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Let's discuss your project and see how we can help bring your AI vision to life.
              </p>
              <motion.button
                className="px-10 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start a conversation
              </motion.button>
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
