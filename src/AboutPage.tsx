import { motion } from "motion/react";
import { AboutHero } from "./components/about/AboutHero";
import { VisionSection } from "./components/about/VisionSection";
import { TimelineSection } from "./components/about/TimelineSection";
import { CapabilitiesSection } from "./components/about/CapabilitiesSection";
import { TeamSection } from "./components/about/TeamSection";
import { CultureSection } from "./components/about/CultureSection";
import { ImpactSection } from "./components/about/ImpactSection";
import { ResourcesSection } from "./components/about/ResourcesSection";
import { JoinUsCTA } from "./components/about/JoinUsCTA";
import { Footer } from "./components/Footer";

// Reusable animated section wrapper
function AnimatedSection({ 
  children, 
  delay = 0,
  className = ""
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <>
      
      {/* Hero - no wrapper needed, already animated */}
      <AboutHero />
      
      {/* Vision & Philosophy */}
      <AnimatedSection>
        <VisionSection />
      </AnimatedSection>
      
      {/* Our Story Timeline */}
      <AnimatedSection delay={0.1}>
        <TimelineSection />
      </AnimatedSection>
      
      {/* Capabilities */}
      <AnimatedSection>
        <CapabilitiesSection />
      </AnimatedSection>
      
      {/* Team */}
      <AnimatedSection>
        <TeamSection />
      </AnimatedSection>
      
      {/* Culture & Values */}
      <AnimatedSection>
        <CultureSection />
      </AnimatedSection>
      
      {/* Impact & Metrics */}
      <AnimatedSection>
        <ImpactSection />
      </AnimatedSection>
      
      {/* Resources & Recognition */}
      <AnimatedSection>
        <ResourcesSection />
      </AnimatedSection>
      
      {/* Join Us CTA */}
      <AnimatedSection>
        <JoinUsCTA />
      </AnimatedSection>
      
      {/* Footer */}
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </>
  );
}
