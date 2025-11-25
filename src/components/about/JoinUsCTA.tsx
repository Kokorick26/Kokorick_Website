import { motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";

export function JoinUsCTA() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight"
            >
              Ready to engineer the future of
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                intelligence with us?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/70 text-lg sm:text-xl mb-10 max-w-3xl mx-auto"
            >
              Let's build AI systems that don't just work—they last.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-black hover:bg-white/90 transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Work with us</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-10 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                Explore Careers
              </motion.button>
            </motion.div>

            {/* Email contact */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/50"
            >
              <Mail className="w-4 h-4" />
              <p className="text-sm">
                Prefer email?{" "}
                <a
                  href="mailto:hello@kokorick.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors underline"
                >
                  hello@kokorick.com
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
