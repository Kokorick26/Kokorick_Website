import { motion } from "motion/react";
import { Linkedin, Github } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const team = [
  {
    name: "Akshat Sharma",
    role: "Founder & Lead Engineer",
    quote: "We design AI systems that are measurable, auditable, and built to last.",
    bio: "10+ years building ML systems at scale. Previously led AI engineering at enterprise startups. PhD dropout who chose production over papers.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Sarah Chen",
    role: "Head of Research",
    quote: "Bridging the gap between cutting-edge research and real-world deployment.",
    bio: "Former research scientist at major tech labs. Specializes in LLMs, multimodal systems, and efficient fine-tuning.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Marcus Rodriguez",
    role: "Principal Engineer",
    quote: "Every system we build is designed for reliability, not just performance.",
    bio: "Infrastructure specialist with deep expertise in distributed systems, MLOps, and production-grade AI pipelines.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
  {
    name: "Emily Zhang",
    role: "Head of Product",
    quote: "AI products should be intuitive, trustworthy, and measurably valuable.",
    bio: "Product leader with background in AI/ML products. Focuses on user-centric design and measurable business outcomes.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
];

export function TeamSection() {
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Leadership Team
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            Meet the people building the future of AI systems
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                {/* Portrait */}
                <div className="relative mb-6 overflow-hidden rounded-xl aspect-square">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <h3 className="text-xl text-white mb-1">{member.name}</h3>
                <p className="text-blue-400 text-sm mb-3">{member.role}</p>
                
                {/* Quote */}
                <p className="text-white/60 text-sm italic mb-4 leading-relaxed">
                  "{member.quote}"
                </p>

                {/* Bio */}
                <p className="text-white/50 text-xs mb-4 leading-relaxed">
                  {member.bio}
                </p>

                {/* Social Links */}
                <div className="flex gap-3">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center transition-all"
                  >
                    <Linkedin className="w-4 h-4 text-white/60 hover:text-blue-400" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center transition-all"
                  >
                    <Github className="w-4 h-4 text-white/60 hover:text-blue-400" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
