import { motion } from "motion/react";
import { ShaderAnimation } from "./ShaderAnimation";
import { cn } from "./ui/utils";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Shader Animation Background */}
      <div className="absolute inset-0 opacity-50">
        <ShaderAnimation />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-[5]" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-[2]">
        {[...Array(15)].map((_, i) => (
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-32 text-center">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="text-3xl md:text-5xl lg:text-6xl mb-6 text-white/90 font-light">
            Bridging the gap between
          </div>
          <div className="text-4xl md:text-6xl lg:text-7xl mb-6">
            <span
              className={cn(
                'relative inline-block text-transparent font-medium',
                'before:absolute before:inset-0 before:animate-[onloadopacity_1s_ease-out_forwards] before:opacity-0 before:content-[attr(data-text)]',
                'before:bg-[linear-gradient(0deg,#dfe5ee_0%,#fffaf6_50%)] before:bg-clip-text before:text-transparent',
                '[filter:url(#glow-4)]',
              )}
              data-text="AI Research & Real-World Impact"
            >
              AI Research & Real-World Impact
            </span>
          </div>
          <div className="text-3xl md:text-5xl lg:text-6xl text-white/90 font-light">
            for intelligent systems.
          </div>
        </motion.div>

        <motion.p
          className="max-w-3xl mx-auto mb-12 bg-gradient-to-t from-[#86868b] to-[#bdc2c9] bg-clip-text text-transparent text-lg md:text-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          We're an AI-driven software engineering studio building systems that don't just run — they{' '}
          <span className="relative inline-block text-[#e7dfd6] font-medium">
            reason.
          </span>{' '}
          At Kokorick, we turn deep tech research into scalable, production-grade solutions — from agentic AI platforms to full-stack enterprise systems.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            className="px-10 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Talk to Our Team
          </motion.button>
          <motion.button
            className="px-10 py-4 rounded-full bg-transparent border border-white/20 text-white font-medium hover:bg-white/5 transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Our Work
          </motion.button>
        </motion.div>
      </div>

      {/* SVG Filter for Glow Effect */}
      <svg
        className="absolute -z-1 h-0 w-0"
        width="0"
        height="0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="glow-4"
            colorInterpolationFilters="sRGB"
            x="-50%"
            y="-200%"
            width="200%"
            height="500%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="4"
              result="blur4"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="19"
              result="blur19"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="9"
              result="blur9"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="30"
              result="blur30"
            />
            <feColorMatrix
              in="blur4"
              result="color-0-blur"
              type="matrix"
              values="1 0 0 0 0
                0 0.9803921568627451 0 0 0
                0 0 0.9647058823529412 0 0
                0 0 0 0.8 0"
            />
            <feOffset
              in="color-0-blur"
              result="layer-0-offsetted"
              dx="0"
              dy="0"
            />
            <feColorMatrix
              in="blur19"
              result="color-1-blur"
              type="matrix"
              values="0.8156862745098039 0 0 0 0
                0 0.49411764705882355 0 0 0
                0 0 0.2627450980392157 0 0
                0 0 0 1 0"
            />
            <feOffset
              in="color-1-blur"
              result="layer-1-offsetted"
              dx="0"
              dy="2"
            />
            <feColorMatrix
              in="blur9"
              result="color-2-blur"
              type="matrix"
              values="1 0 0 0 0
                0 0.6666666666666666 0 0 0
                0 0 0.36470588235294116 0 0
                0 0 0 0.65 0"
            />
            <feOffset
              in="color-2-blur"
              result="layer-2-offsetted"
              dx="0"
              dy="2"
            />
            <feColorMatrix
              in="blur30"
              result="color-3-blur"
              type="matrix"
              values="1 0 0 0 0
                0 0.611764705882353 0 0 0
                0 0 0.39215686274509803 0 0
                0 0 0 1 0"
            />
            <feOffset
              in="color-3-blur"
              result="layer-3-offsetted"
              dx="0"
              dy="2"
            />
            <feColorMatrix
              in="blur30"
              result="color-4-blur"
              type="matrix"
              values="0.4549019607843137 0 0 0 0
                0 0.16470588235294117 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
            />
            <feOffset
              in="color-4-blur"
              result="layer-4-offsetted"
              dx="0"
              dy="16"
            />
            <feColorMatrix
              in="blur30"
              result="color-5-blur"
              type="matrix"
              values="0.4235294117647059 0 0 0 0
                0 0.19607843137254902 0 0 0
                0 0 0.11372549019607843 0 0
                0 0 0 1 0"
            />
            <feOffset
              in="color-5-blur"
              result="layer-5-offsetted"
              dx="0"
              dy="64"
            />
            <feColorMatrix
              in="blur30"
              result="color-6-blur"
              type="matrix"
              values="0.21176470588235294 0 0 0 0
                0 0.10980392156862745 0 0 0
                0 0 0.07450980392156863 0 0
                0 0 0 1 0"
            />
            <feOffset
              in="color-6-blur"
              result="layer-6-offsetted"
              dx="0"
              dy="64"
            />
            <feColorMatrix
              in="blur30"
              result="color-7-blur"
              type="matrix"
              values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0.68 0"
            />
            <feOffset
              in="color-7-blur"
              result="layer-7-offsetted"
              dx="0"
              dy="64"
            />
            <feMerge>
              <feMergeNode in="layer-0-offsetted" />
              <feMergeNode in="layer-1-offsetted" />
              <feMergeNode in="layer-2-offsetted" />
              <feMergeNode in="layer-3-offsetted" />
              <feMergeNode in="layer-4-offsetted" />
              <feMergeNode in="layer-5-offsetted" />
              <feMergeNode in="layer-6-offsetted" />
              <feMergeNode in="layer-7-offsetted" />
              <feMergeNode in="layer-0-offsetted" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </section>
  );
}
