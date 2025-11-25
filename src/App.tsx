"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StatsSection } from "./components/StatsSection";
import { SubHeader } from "./components/SubHeader";
import { ServicesSection } from "./components/ServicesSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import AboutPage from "./AboutPage";
import ServicesPage from "./ServicesPage";
import ProjectsPage from "./ProjectsPage";
import GetStartedPage from "./GetStartedPage";
import AdminPage from "./AdminPage";

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

function HomePage() {
  return (
    <>
      {/* Hero - no wrapper needed, already animated */}
      <Hero />

      {/* Stats Section */}
      <AnimatedSection>
        <StatsSection />
      </AnimatedSection>

      {/* SubHeader */}
      <AnimatedSection delay={0.1}>
        <SubHeader />
      </AnimatedSection>

      {/* Services Section */}
      <AnimatedSection>
        <ServicesSection />
      </AnimatedSection>

      {/* Projects Section */}
      <AnimatedSection>
        <ProjectsSection />
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection>
        <CTASection />
      </AnimatedSection>

      {/* Footer */}
      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "about" | "services" | "projects" | "get-started" | "admin">(() => {
    // Check URL pathname on initial load
    const path = window.location.pathname;
    if (path === "/login" || path === "/admin") return "admin";
    if (path === "/get-started") return "get-started";
    if (path === "/about") return "about";
    if (path === "/services") return "services";
    if (path === "/projects") return "projects";
    return "home";
  });

  // Listen for popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/login" || path === "/admin") {
        setCurrentPage("admin");
      } else if (path === "/get-started") {
        setCurrentPage("get-started");
      } else if (path === "/about") {
        setCurrentPage("about");
      } else if (path === "/services") {
        setCurrentPage("services");
      } else if (path === "/projects") {
        setCurrentPage("projects");
      } else {
        setCurrentPage("home");
      }
    };
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "about":
        return <AboutPage />;
      case "services":
        return <ServicesPage />;
      case "projects":
        return <ProjectsPage />;
      case "get-started":
        return <GetStartedPage />;
      case "admin":
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  // Don't show navbar on admin page
  const showNavbar = currentPage !== "admin";

  // Admin page needs special handling - no wrapper constraints
  if (currentPage === "admin") {
    return <AdminPage />;
  }

  return (
    <div className="w-full bg-black">
      {showNavbar && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      {renderPage()}
    </div>
  );
}
