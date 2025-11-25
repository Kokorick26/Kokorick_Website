import { motion } from "motion/react";
import { FileText, Newspaper, BookOpen, Download } from "lucide-react";

const resources = [
  {
    icon: FileText,
    title: "Case Studies",
    description: "Deep dives into our most impactful projects",
    link: "#",
  },
  {
    icon: BookOpen,
    title: "Whitepapers",
    description: "Technical insights on production AI systems",
    link: "#",
  },
  {
    icon: Newspaper,
    title: "Press & Media",
    description: "Latest news and industry recognition",
    link: "#",
  },
  {
    icon: FileText,
    title: "Technical Blog",
    description: "Engineering insights from our team",
    link: "#",
  },
];

export function ResourcesSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Resources & Recognition
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            Explore our insights and industry presence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.a
                key={resource.title}
                href={resource.link}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg text-white mb-2">{resource.title}</h3>
                  <p className="text-white/60 text-sm flex-grow">{resource.description}</p>
                  <div className="mt-4 text-blue-400 text-sm flex items-center gap-2">
                    <span>Learn more</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Featured Resource CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 sm:p-12 text-center">
            <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl text-white mb-4">
              How We Deliver Production AI
            </h3>
            <p className="text-white/60 text-lg mb-6 max-w-2xl mx-auto">
              Download our comprehensive whitepaper on building reliable, scalable AI systems.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            >
              Download Whitepaper
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
