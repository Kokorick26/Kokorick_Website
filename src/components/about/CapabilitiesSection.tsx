import { motion } from "motion/react";
import { Brain, Bot, Layers, ArrowRight } from "lucide-react";

const capabilities = [
  {
    icon: Brain,
    title: "AI Engineering",
    description: "Custom models, fine-tuning, inference optimization, ML system design.",
    link: "#",
  },
  {
    icon: Bot,
    title: "Automation & Agents",
    description: "Intelligent workflows and agentic systems with human-in-loop controls.",
    link: "#",
  },
  {
    icon: Layers,
    title: "Full Stack Platforms",
    description: "Data ingestion, model serving, secure UI, observability; end to end ownership.",
    link: "#",
  },
];

export function CapabilitiesSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            What We Do
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            Capabilities Snapshot
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 mb-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl text-white mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-white/60 text-base leading-relaxed mb-6 flex-grow">
                    {capability.description}
                  </p>

                  {/* Link */}
                  <a
                    href={capability.link}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group/link"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
