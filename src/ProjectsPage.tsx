import { cn } from "./components/ui/utils";
import { useState, useEffect } from "react";
import { MoveRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "./components/Footer";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  href: string;
  views?: number;
  readTime?: number;
  rating?: number;
  className?: string;
}

interface GridSectionProps {
  title: string;
  description: string;
  backgroundLabel?: string;
  backgroundPosition?: "left" | "right";
  posts?: BlogPost[];
  className?: string;
  onPostClick?: (post: BlogPost) => void;
}

const GridSection = ({
  title,
  description,
  backgroundLabel,
  backgroundPosition = "left",
  posts = [],
  className,
  onPostClick,
}: GridSectionProps) => {

  return (
    <section className={cn(
      "max-w-7xl relative my-20 py-10 mx-auto px-4",
      className
    )}>
      <div className="relative z-10 mb-24 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 mb-6 backdrop-blur-md">
            Our Portfolio
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-[1.1]">
            {title}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl mx-auto"
        >
          {description}
        </motion.p>
      </div>

      {backgroundLabel && (
        <span
          className={cn(
            "absolute top-0 -z-50 select-none text-[120px] font-extrabold leading-[1] text-white/[0.03] md:text-[200px] lg:text-[350px]",
            backgroundPosition === "left" ? "-left-[10%]" : "-right-[10%]"
          )}
        >
          {backgroundLabel}
        </span>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[300px]">
        {posts.map((post, index) => {
          const {
            id,
            title: postTitle,
            category,
            imageUrl,
            views,
            readTime,
            rating,
            className: postClassName
          } = post;

          // Scalable Bento Grid Logic (Repeating pattern every 10 items)
          const patternIndex = index % 10;
          const isLarge = patternIndex === 0; // 2x2
          const isWide = patternIndex === 3 || patternIndex === 7; // 3x1

          return (
            <motion.div
              key={id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ backgroundImage: `url(${imageUrl})` }}
              className={cn(
                "group relative flex size-full cursor-pointer flex-col justify-end overflow-hidden rounded-[30px] bg-cover bg-center bg-no-repeat p-8 text-white transition-all duration-500",
                isLarge ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1",
                isWide && "md:col-span-3 md:row-span-1",
                postClassName
              )}
              onClick={() => onPostClick?.(post)}
            >
              <div className="absolute inset-0 -z-0 h-full w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <article className="relative z-0 flex items-end justify-between gap-4">
                <div className="flex flex-1 flex-col gap-3">
                  <h1 className={cn("font-bold leading-tight", isLarge || isWide ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl")}>
                    {postTitle}
                  </h1>
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium uppercase tracking-wider py-1 px-3 rounded-full bg-white/20 backdrop-blur-md w-fit text-white border border-white/10">
                      {category}
                    </span>

                    {(views || rating) && (
                      <div className="flex items-center gap-3 text-white/80">
                        {rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                width={16}
                                height={16}
                                key={idx}
                                stroke={idx < rating ? "#ffa534" : "#ffffff60"}
                                fill={idx < rating ? "#ffa534" : "none"}
                              />
                            ))}
                          </div>
                        )}
                        {views && (
                          <span className="text-sm font-light">
                            ({views.toLocaleString()} Views)
                          </span>
                        )}
                      </div>
                    )}

                    {readTime && (
                      <div className="text-sm font-medium text-white/60">
                        {readTime} min read
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-2 rounded-full border border-white/30 p-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:border-white">
                  <MoveRight
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    width={24}
                    height={24}
                    strokeWidth={2}
                  />
                </div>
              </article>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default function ProjectsPage({ onProjectClick }: { onProjectClick?: (project: BlogPost) => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        // Map API data to BlogPost structure - NO FAKE DATA
        const mapped = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          category: (p.tags && p.tags[0]) || "Project",
          imageUrl: p.imageUrl || p.image,
          href: p.link || "#",
          // Only include these if they actually exist in the API response
          views: p.views,
          readTime: p.readTime,
          rating: p.rating,
          // Pass through extra fields for details page
          description: p.description,
          fullDescription: p.fullDescription,
          impact: p.impact,
          challenges: p.challenges,
          results: p.results,
          tags: p.tags,
          createdAt: p.createdAt,
          className: ""
        }));
        setPosts(mapped);
      })
      .catch(err => console.error("Failed to load projects", err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <GridSection
        title="Engineering Intelligence"
        description="Explore our portfolio of production-grade AI systems. From autonomous agents to enterprise RAG platforms, we build solutions that drive real business value."
        backgroundLabel="WORK"
        posts={posts}
        onPostClick={onProjectClick}
      />
      <Footer />
    </div>
  );
}
