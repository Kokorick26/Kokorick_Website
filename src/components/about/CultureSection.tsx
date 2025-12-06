import { motion } from "motion/react";
import { Sparkles, Code2, Handshake } from "lucide-react";

const values = [
  {
    icon: Sparkles,
    title: "Curiosity drives product decisions",
    description: "We ask hard questions, challenge assumptions, and explore beyond the obvious.",
  },
  {
    icon: Code2,
    title: "Precision in code and data",
    description: "Every line matters. Every metric is measured. Quality is non negotiable.",
  },
  {
    icon: Handshake,
    title: "Long term partnerships, not one off projects",
    description: "We build relationships that last, creating value that compounds over time.",
  },
];

export function CultureSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-hidden">
      {/* Optional: Background video or animation placeholder */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Culture & Values
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            The principles that guide everything we do
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="w-12 h-12 mb-6 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center border border-blue-500/40">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl text-white mb-3 leading-snug">
                    {value.title}
                  </h3>
                  <p className="text-white/60 text-base leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
