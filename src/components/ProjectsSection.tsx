"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Scale, Boxes, TreeDeciduous, ArrowLeft, ArrowRight } from "lucide-react";

const iconMap: Record<string, any> = {
  "Scale": Scale,
  "Boxes": Boxes,
  "TreeDeciduous": TreeDeciduous,
  "default": Boxes
};

// Helper to get icon
const getIcon = (_project: any) => {
  return iconMap["default"];
};

// Helper function to strip HTML tags and get plain text
function stripHtml(html: string): string {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Helper function to truncate text to approximately N words
function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  impact?: string;
  technologies?: string[];
  tags?: string[];
  challenges?: string[];
  results?: string[];
  image?: string;
  imageUrl?: string;
  icon?: any;
}

interface ProjectsSectionProps {
  onProjectClick?: (project: Project) => void;
}

export function ProjectsSection({ onProjectClick }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/projects/featured')
      .then(res => res.json())
      .then(data => {
        // Map API data to component structure
        const mapped = data.map((p: any) => ({
          ...p,
          image: p.imageUrl || p.image,
          technologies: p.tags || p.technologies,
          icon: getIcon(p),
          // Ensure arrays exist
          challenges: p.challenges || [],
          results: p.results || [],
          fullDescription: p.fullDescription || p.description
        }));
        setProjects(mapped);
      })
      .catch(err => console.error("Failed to load featured projects", err));
  }, []);

  return (
    <section className="relative py-16 md:py-20 px-4 bg-black overflow-x-hidden">
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
                  className="text-3xl md:text-4xl lg:text-5xl text-white mb-4"
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Short description */}
                    <div>
                      <p className="text-white/70 leading-relaxed text-lg">
                        {projects[selectedProject].description}
                      </p>
                    </div>

                    {/* Clean overview - truncated to ~50 words */}
                    {projects[selectedProject].fullDescription && 
                     projects[selectedProject].fullDescription !== projects[selectedProject].description && (
                      <div>
                        <h4 className="text-white/80 font-medium mb-2">Overview</h4>
                        <p className="text-white/60 leading-relaxed">
                          {truncateToWords(stripHtml(projects[selectedProject].fullDescription || ""), 50)}
                        </p>
                      </div>
                    )}

                    {/* Key Impact */}
                    {projects[selectedProject].impact && (
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <h4 className="text-white/80 font-medium mb-1">Key Impact</h4>
                        <p className="text-primary font-medium">
                          {projects[selectedProject].impact}
                        </p>
                      </div>
                    )}

                    {/* Technologies */}
                    {projects[selectedProject]?.technologies && projects[selectedProject].technologies.length > 0 && (
                      <div>
                        <h4 className="text-white/80 font-medium mb-3">Technologies</h4>
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
                    )}

                    {/* Read More Button */}
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          if (onProjectClick) {
                            onProjectClick(projects[selectedProject]);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-colors group"
                      >
                        Read Full Case Study
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
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
