"use client"


import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"
import logo from "../assets/logo.png"

interface NavbarProps {
  currentPage?: "home" | "about" | "services" | "projects" | "get-started" | "admin" | "project-details" | "blog" | "blog-detail";
  setCurrentPage?: (page: "home" | "about" | "services" | "projects" | "get-started" | "admin" | "project-details" | "blog" | "blog-detail") => void;
}

export function Navbar({ currentPage = "home", setCurrentPage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const handleNavigation = (page: "home" | "about" | "services" | "projects" | "get-started" | "admin" | "project-details" | "blog" | "blog-detail") => {
    if (setCurrentPage) {
      // Update URL without page reload
      const paths: Record<typeof page, string> = {
        home: "/",
        about: "/about",
        services: "/services",
        projects: "/projects",
        "get-started": "/get-started",
        admin: "/login",
        "project-details": "/projects",
        blog: "/blog",
        "blog-detail": "/blog",
      };

      window.history.pushState({}, "", paths[page]);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const navItems = [
    { label: "About", page: "about" as const },
    { label: "Services", page: "services" as const },
    { label: "Case Studies", page: "projects" as const },
    { label: "Blog", page: "blog" as const },
  ]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full py-4 sm:py-6 px-4">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/80 backdrop-blur-lg rounded-full border border-white/10 shadow-xl w-full max-w-4xl relative">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavigation("home")}
        >
          <motion.div
            className="w-8 h-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <img src={logo} alt="Kokorick AI Logo" className="w-full h-full object-contain" />
          </motion.div>
          <span className="text-white font-bold text-xl tracking-tight">Kokorick AI</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => handleNavigation(item.page)}
                className={`text-sm transition-colors ${currentPage === item.page ? "text-white" : "text-white/70 hover:text-white"
                  }`}
              >
                {item.label}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            onClick={() => handleNavigation("get-started")}
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-black bg-white rounded-full hover:bg-white/90 transition-colors"
          >
            Get Started
          </button>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-white" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={() => {
                      handleNavigation(item.page);
                      toggleMenu();
                    }}
                    className={`text-base ${currentPage === item.page ? "text-white" : "text-white/70"
                      }`}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <button
                  onClick={() => {
                    handleNavigation("get-started");
                    toggleMenu();
                  }}
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-black bg-white rounded-full hover:bg-white/90 transition-colors"
                >
                  Get Started
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
