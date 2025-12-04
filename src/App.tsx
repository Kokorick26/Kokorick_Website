"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Lenis from 'lenis';
import { Toaster } from 'sonner';
import AnalyticsTracker from "./components/AnalyticsTracker";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StatsSection } from "./components/StatsSection";
import { SubHeader } from "./components/SubHeader";
import { ServicesSection } from "./components/ServicesSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { Testimonials } from "./components/Testimonials";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import AboutPage from "./AboutPage";
import ServicesPage from "./ServicesPage";
import ProjectsPage from "./ProjectsPage";
import GetStartedPage from "./GetStartedPage";
import AdminPage from "./AdminPage";
import ProjectDetailsPage from "./ProjectDetailsPage";
import BlogPage from "./BlogPage";
import BlogDetailPage from "./BlogDetailPage";

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

function HomePage({ onProjectClick }: { onProjectClick?: (project: any) => void }) {
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
        <ProjectsSection onProjectClick={onProjectClick} />
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection>
        <Testimonials />
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
  const [currentPage, setCurrentPage] = useState<"home" | "about" | "services" | "projects" | "get-started" | "admin" | "project-details" | "blog" | "blog-detail">(() => {
    // Check URL pathname on initial load
    const path = window.location.pathname;
    if (path === "/login" || path === "/admin") return "admin";
    if (path === "/get-started") return "get-started";
    if (path === "/about") return "about";
    if (path === "/services") return "services";
    if (path === "/projects") return "projects";
    if (path === "/blog") return "blog";
    if (path.startsWith("/blog/")) return "blog-detail";
    return "home";
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith("/blog/")) {
      return path.replace("/blog/", "");
    }
    return null;
  });

  // Initialize Lenis for smooth scrolling (only on non-admin pages)
  useEffect(() => {
    // Don't initialize Lenis on admin pages - admin has its own scroll handling
    if (currentPage === "admin") {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
    });

    let animationId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationId = requestAnimationFrame(raf);
    }

    animationId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationId);
      lenis.destroy();
    };
  }, [currentPage]);

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
      } else if (path === "/blog") {
        setCurrentPage("blog");
      } else if (path.startsWith("/blog/")) {
        setSelectedBlogSlug(path.replace("/blog/", ""));
        setCurrentPage("blog-detail");
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleProjectClick = (project: any) => {
    setSelectedProjectId(project.id);
    setCurrentPage("project-details");
    window.scrollTo(0, 0);
  };

  const handleBlogClick = (slug: string) => {
    setSelectedBlogSlug(slug);
    setCurrentPage("blog-detail");
    window.history.pushState({}, "", `/blog/${slug}`);
    window.scrollTo(0, 0);
  };

  const handleBackToBlog = () => {
    setCurrentPage("blog");
    window.history.pushState({}, "", "/blog");
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onProjectClick={handleProjectClick} />;
      case "about":
        return <AboutPage />;
      case "services":
        return <ServicesPage />;
      case "projects":
        return <ProjectsPage onProjectClick={handleProjectClick} />;
      case "get-started":
        return <GetStartedPage />;
      case "admin":
        return <AdminPage />;
      case "project-details":
        return (
          <ProjectDetailsPage
            projectId={selectedProjectId!}
            onBack={() => setCurrentPage("projects")}
          />
        );
      case "blog":
        return <BlogPage onBlogClick={handleBlogClick} />;
      case "blog-detail":
        return (
          <BlogDetailPage
            slug={selectedBlogSlug!}
            onBack={handleBackToBlog}
            onBlogClick={handleBlogClick}
          />
        );
      default:
        return <HomePage onProjectClick={handleProjectClick} />;
    }
  };

  // Don't show navbar on admin page
  const showNavbar = currentPage !== "admin";

  // Admin page needs special handling - no wrapper constraints
  if (currentPage === "admin") {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #3f3f46',
              color: '#fff',
            },
          }}
        />
        <AdminPage />
      </>
    );
  }

  return (
    <div className="w-full bg-black">
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #3f3f46',
            color: '#fff',
          },
        }}
      />
      {showNavbar && <AnalyticsTracker />}
      {showNavbar && <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />}
      {renderPage()}
    </div>
  );
}
