"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Scale, Boxes, TreeDeciduous, ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "./ui/utils";

const projects = [
  {
    icon: Scale,
    title: "AI-Powered Legal Outcome Prediction",
    description: "An advanced Generative AI engine that forecasts court case outcomes by analyzing legal precedents, expert witness performance, and contextual judgment data.",
    fullDescription: "This sophisticated system leverages state-of-the-art Large Language Models and Retrieval-Augmented Generation to provide unprecedented insights into legal case outcomes. By analyzing thousands of historical precedents, expert witness testimonies, and contextual judgment data, our system delivers actionable predictions with remarkable accuracy. The platform integrates seamlessly with existing legal workflows and provides detailed reasoning for each prediction.",
    impact: "80%+ predictive accuracy in pilot tests.",
    technologies: ["LLMs", "RAG", "Python", "Vector Databases"],
    challenges: ["Complex legal reasoning", "Multi-jurisdiction support", "Real-time updates"],
    results: ["Reduced case preparation time by 60%", "Improved settlement negotiations", "Enhanced client satisfaction"],
    image: "https://images.unsplash.com/photo-1758518731462-d091b0b4ed0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMG9mZmljZXxlbnwxfHx8fDE3NjExNTA5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Boxes,
    title: "AI Timber Detection & Dimensioning",
    description: "A multi-phase pipeline using Computer Vision, OCR, and Generative AI to detect, segment, and measure timber planks with industrial-grade accuracy.",
    fullDescription: "Our cutting-edge timber detection system revolutionizes lumber yard operations through a sophisticated multi-phase pipeline. Combining advanced Computer Vision techniques with OCR and Generative AI, the system accurately detects, segments, and measures timber planks in real-time. This automation eliminates manual counting errors and dramatically improves logistics efficiency across the supply chain.",
    impact: "Automated timber counting and measurement for logistics optimization.",
    technologies: ["PyTorch", "SAHI", "Google Vision API", "Decision Tree Models"],
    challenges: ["Variable lighting conditions", "Overlapping timber detection", "Real-time processing"],
    results: ["99.2% counting accuracy", "70% faster inventory processing", "Reduced labor costs by 40%"],
    image: "https://images.unsplash.com/photo-1759240215970-c14e6859ccb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1iZXIlMjB3b29kJTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3NjEyNDI5MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: TreeDeciduous,
    title: "Tree Crown Segmentation Platform",
    description: "A Deep Learning system for environmental planning, using RetinaNet and Mask R-CNN to detect and segment tree crowns from high-resolution aerial imagery.",
    fullDescription: "This environmental intelligence platform employs state-of-the-art Deep Learning architectures to analyze aerial imagery for urban planning and environmental conservation. Using RetinaNet for detection and Mask R-CNN for precise segmentation, the system identifies individual tree crowns with exceptional accuracy, enabling better urban forestry management and environmental impact assessments.",
    impact: "84%+ F1-score, outperforming existing Detectree benchmarks.",
    technologies: ["Detectron2", "COCO datasets", "GeoJSON", "Python"],
    challenges: ["High-resolution image processing", "Dense canopy detection", "Multi-species recognition"],
    results: ["Processed 100+ sq km of urban forestry", "Enabled data-driven conservation", "Improved planning efficiency by 50%"],
    image: "https://images.unsplash.com/photo-1585644013005-a8028ecd0bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjB0cmVlc3xlbnwxfHx8fDE3NjExNDQ0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function ProjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  return (
    <section className="relative py-20 px-4 bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        
        <AnimatePresence mode="wait">
          {selectedProject === null ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header Section */}
              <div className="relative z-10 text-center pt-16 pb-8 px-8">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-6xl text-white mb-4"
                >
                  Featured Projects
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-white/60 text-lg max-w-3xl mx-auto mb-12"
                >
                  Case studies highlighting our innovative AI solutions across industries
                </motion.p>
              </div>

              {/* Desktop 3D overlapping layout - hidden on mobile */}
              <div className="hidden md:block relative overflow-x-clip overflow-y-visible h-[400px] -mb-[200px]">
                <div className="flex -space-x-72 md:-space-x-80 pb-8 pt-40 items-end justify-center max-w-full">
                  {projects.map((project, index) => {
                    // Calculate stagger height - peak in middle, descending to edges
                    const totalProjects = projects.length;
                    const middle = Math.floor(totalProjects / 2);
                    const distanceFromMiddle = Math.abs(index - middle);
                    const staggerOffset = 120 - distanceFromMiddle * 20;

                    const zIndex = totalProjects - index;

                    const isHovered = hoveredIndex === index;
                    const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

                    // When hovering: hovered card moves to consistent top position, others move to baseline
                    const yOffset = isHovered ? -120 : isOtherHovered ? 0 : -staggerOffset;

                    return (
                      <motion.div
                        key={index}
                        className="group cursor-pointer flex-shrink-0"
                        style={{
                          zIndex: isHovered ? 999 : zIndex,
                        }}
                        initial={{
                          transform: `perspective(5000px) rotateY(-45deg) translateY(200px)`,
                          opacity: 0,
                        }}
                        animate={{
                          transform: `perspective(5000px) rotateY(-45deg) translateY(${yOffset}px)`,
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.05,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        onClick={() => setSelectedProject(index)}
                      >
                        <div
                          className="relative aspect-video w-64 md:w-80 lg:w-96 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
                          style={{
                            boxShadow: `
                              rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                              rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                              rgba(0, 0, 0, 0.08) 6.38265px 0px 6.38265px 0px,
                              rgba(0, 0, 0, 0.25) 20px 0px 20px 0px
                            `,
                          }}
                        >
                          <ImageWithFallback
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover object-left-top"
                          />
                          
                          {/* Icon badge */}
                          <div className="absolute top-4 left-4 w-12 h-12 rounded-lg bg-black/80 backdrop-blur-sm flex items-center justify-center">
                            <project.icon className="w-6 h-6 text-primary" />
                          </div>

                          {/* Title on hover - appears at top */}
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black via-black/90 to-transparent p-6 pt-20"
                            >
                              <h3 className="text-xl text-white">{project.title}</h3>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile layout - simple stack */}
              <div className="block md:hidden px-4 pb-8 space-y-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedProject(index)}
                  >
                    <div
                      className="relative rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                      style={{
                        boxShadow: `
                          rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                          rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                          rgba(0, 0, 0, 0.08) 6.38265px 0px 6.38265px 0px,
                          rgba(0, 0, 0, 0.25) 20px 0px 20px 0px
                        `,
                      }}
                    >
                      <div className="relative aspect-video bg-muted">
                        <ImageWithFallback
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-black/80 backdrop-blur-sm flex items-center justify-center">
                          <project.icon className="w-5 h-5 text-primary" />
                        </div>
                        
                        {/* Title overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4">
                          <h3 className="text-base text-white">{project.title}</h3>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-12"
            >
              {/* Back button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>See Other Projects</span>
              </button>

              {/* Project detail view */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {/* Left: Image */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-muted">
                  <ImageWithFallback
                    src={projects[selectedProject].image}
                    alt={projects[selectedProject].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right: Content */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = projects[selectedProject].icon;
                        return <Icon className="w-7 h-7 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl text-white mb-2">
                        {projects[selectedProject].title}
                      </h2>
                      <p className="text-white/60">
                        {projects[selectedProject].description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white/80 mb-2">Overview</h4>
                      <p className="text-white/70 leading-relaxed">
                        {projects[selectedProject].fullDescription}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white/80 mb-2">Key Impact</h4>
                      <p className="text-primary">
                        {projects[selectedProject].impact}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-white/80 mb-3">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {projects[selectedProject].technologies.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-white/10 text-white border-white/20"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white/80 mb-3">Challenges</h4>
                      <ul className="space-y-2">
                        {projects[selectedProject].challenges.map((challenge, i) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-white/80 mb-3">Results</h4>
                      <ul className="space-y-2">
                        {projects[selectedProject].results.map((result, i) => (
                          <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">✓</span>
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
