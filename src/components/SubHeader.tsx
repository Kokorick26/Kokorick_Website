"use client";

import { motion } from "motion/react";

const paragraphs = [
  "Kokorick is a next-generation software studio specializing in AI-powered product engineering.",
  "We combine deep-learning research, generative AI innovation, and full-stack development to build intelligent systems that drive measurable business outcomes.",
  "Our team bridges the gap between academic-grade AI research and production-ready software — transforming models into working solutions that automate, analyze, and scale across industries.",
  "Whether it's developing agentic AI products, automating workflows with machine learning, or architecting cloud-native platforms, we help forward-thinking companies turn complex data challenges into competitive advantage."
];

export function SubHeader() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {paragraphs.map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-white/70 text-lg md:text-xl leading-relaxed"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
