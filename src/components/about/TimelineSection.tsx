import { motion } from "motion/react";
import { useRef } from "react";

const timelineData = [
  {
    year: "2023",
    title: "Research Roots",
    description: "First prototypes and internal pilots launched.",
  },
  {
    year: "2024",
    title: "Enterprise Deployment",
    description: "First enterprise deployment in fintech sector.",
  },
  {
    year: "2025",
    title: "Platform Launch",
    description: "Launch of Kokorick AI modular AI platform.",
  },
];

export function TimelineSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-6">
            Our Story
          </h2>
          <p className="text-white/60 text-lg sm:text-xl max-w-3xl mx-auto">
            From lab prototypes to resilient production systems, our story is one of engineering discipline and continuous deployment.
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <div className="hidden md:block relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          <div className="grid grid-cols-3 gap-8">
            {timelineData.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Timeline dot */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-black z-10" />

                {/* Content card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-8 hover:bg-white/10 transition-all duration-300">
                  <div className="text-4xl text-blue-400 mb-3">{item.year}</div>
                  <h3 className="text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline - Swipeable */}
        <div className="md:hidden overflow-x-auto scrollbar-hide" ref={scrollRef}>
          <div className="flex gap-6 pb-4" style={{ width: `${timelineData.length * 300}px` }}>
            {timelineData.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-shrink-0 w-72"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="text-4xl text-blue-400 mb-3">{item.year}</div>
                  <h3 className="text-xl text-white mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
