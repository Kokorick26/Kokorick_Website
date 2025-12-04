"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Check } from "lucide-react";
import logo from "../assets/logo.png";

function Logo() {
  return (
    <img src={logo} alt="Kokorick Logo" className="w-10 h-10 object-contain" />
  );
}

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-black py-16 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 rounded-full bg-primary/10 p-8"
          >
            <Logo />
          </motion.div>

          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 flex flex-wrap justify-center gap-6 text-white/70"
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.05, color: "rgb(37, 99, 235)" }}
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
          </motion.nav>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 w-full max-w-md"
          >
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 py-3 text-green-400">
                <Check className="w-5 h-5" />
                <span>Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <div className="flex-grow">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-white hover:bg-white/90 text-black disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                </Button>
              </form>
            )}
            <p className="text-xs text-white/50 text-center mt-3">
              Get updates on AI research and engineering insights
            </p>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <p className="text-sm text-white/50">
              © 2025 Kokorick. All rights reserved.
            </p>
            <p className="text-xs text-white/30 mt-1">
              AI-Driven Software Engineering Studio
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
