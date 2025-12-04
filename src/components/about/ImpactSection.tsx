import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

const metrics = [
  { number: 50, suffix: "+", label: "Projects Deployed" },
  { number: 40, suffix: "%", label: "Avg. Deployment Time Reduction" },
  { number: 25, suffix: "+", label: "Enterprise Customers" },
  { number: 60, suffix: "%", label: "Avg. Compute Cost Savings" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} className="tabular-nums">0{suffix}</span>;
}

const testimonials = [
  {
    quote: "Kokorick transformed our AI pipeline from prototype to production in weeks, not months. Their attention to detail and system reliability is unmatched.",
    author: "Sarah Johnson",
    role: "CTO, TechCorp",
  },
  {
    quote: "Working with Kokorick gave us confidence in our AI systems. Everything is measurable, auditable, and built for the long term.",
    author: "Michael Chen",
    role: "VP Engineering, DataFlow",
  },
];

export function ImpactSection() {
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
            Impact & Metrics
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            Real results from real partnerships
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl text-blue-400 mb-3">
                <AnimatedCounter value={metric.number} suffix={metric.suffix} />
              </div>
              <p className="text-white/60 text-sm sm:text-base">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <p className="text-white/80 text-lg mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white">{testimonial.author}</p>
                  <p className="text-white/50 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
