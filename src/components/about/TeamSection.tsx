import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Linkedin, Twitter, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  quote: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  order: number;
  published: boolean;
}

export function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchTeamData = () => {
    fetch('/api/team', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => {
        // Extra client-side filter to ensure only published members show
        const publishedMembers = data.filter((m: TeamMember) => m.published === true);
        setTeam(publishedMembers);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load team:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTeamData();

    // Refresh data when page becomes visible (e.g., when navigating back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchTeamData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  const itemsPerView = 4;
  const maxIndex = Math.max(0, team.length - itemsPerView);
  const showCarousel = team.length > itemsPerView;

  const scrollToIndex = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);

    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / team.length;
      container.scrollTo({
        left: itemWidth * newIndex,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => scrollToIndex(currentIndex - 1);
  const handleNext = () => scrollToIndex(currentIndex + 1);

  if (loading) {
    return (
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60">Loading team...</p>
        </div>
      </section>
    );
  }

  if (team.length === 0) {
    return null; // Don't show section if no team members
  }

  return (
    <section id="team-section" className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-hidden">
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

        <div className="relative">
          {/* Carousel Controls - Only show if more than 4 members */}
          {showCarousel && (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous team members"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next team members"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Team Grid/Carousel */}
          <div
            ref={scrollContainerRef}
            className={`grid ${showCarousel ? 'grid-flow-col auto-cols-[calc(25%-1.5rem)] overflow-x-auto scrollbar-hide snap-x snap-mandatory' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-8`}
            style={showCarousel ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: showCarousel ? 0 : index * 0.1 }}
                className={`h-full ${showCarousel ? 'snap-start' : ''}`}
              >
                <div className="group h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  {/* Portrait */}
                  <div className="relative mb-6 overflow-hidden rounded-xl aspect-square">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <h3 className="text-xl text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 text-sm mb-3">{member.role}</p>

                  {/* Quote */}
                  {member.quote && (
                    <p className="text-white/60 text-sm italic mb-4 leading-relaxed">
                      "{member.quote}"
                    </p>
                  )}

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-white/50 text-xs mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center transition-all"
                      >
                        <Linkedin className="w-4 h-4 text-white/60 hover:text-blue-400" />
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center transition-all"
                      >
                        <Twitter className="w-4 h-4 text-white/60 hover:text-blue-400" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Carousel Indicators - Only show if more than 4 members */}
          {showCarousel && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
