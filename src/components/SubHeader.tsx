"use client";

import { motion } from "motion/react";

const paragraphs = [
  "Kokorick AI is a next-generation software studio specialising in AI-powered product engineering.",
  "We combine deep-learning research, generative AI, and full-stack development to deliver intelligent systems that create measurable business impact.",
  "Our expertise bridge AI and deployable software, transforming breakthrough models into automated, analytic, and scalable solutions for forward-thinking enterprises across industries."
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
