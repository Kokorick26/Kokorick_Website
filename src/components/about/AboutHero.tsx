import { motion } from "motion/react";
import { Sparkles, Target, Zap } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-purple-950/20" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-[5]" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-[2]">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-32">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI Engineering Studio</span>
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 text-white/90 leading-tight font-medium">
            Transforming innovation into
            <span className="block mt-3 text-blue-400 font-bold drop-shadow-sm">
              solutions that shape tomorrow
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          className="max-w-4xl mx-auto mb-12 sm:mb-16 text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          We collaborate with founders and enterprises to engineer, refine, and deliver AI systems that go from prototype to production, ensuring every solution is built for reliability and real impact.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.button
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.history.pushState({}, "", '/get-started');
              window.dispatchEvent(new PopStateEvent('popstate'));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Work with us
          </motion.button>
          <motion.button
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const teamSection = document.getElementById('team-section');
              if (teamSection) {
                teamSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Meet the team
          </motion.button>
        </motion.div>

        {/* Stats/Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { icon: Target, label: "Mission Driven", desc: "Research to production" },
            { icon: Zap, label: "Fast Execution", desc: "Ship in weeks, not months" },
            { icon: Sparkles, label: "AI First", desc: "Deep learning expertise" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
              transition={{ duration: 0.2 }}
            >
              <item.icon className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-white font-medium mb-1">{item.label}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
