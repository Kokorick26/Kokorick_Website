import { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ServiceDropdown } from "./admin/ServiceDropdown";

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;

  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",

    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          status: "new",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",

        message: "",
      });

      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to submit form. Please try again.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClasses = "bg-zinc-800/40 dark:bg-zinc-800/40 border border-zinc-700 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-300 hover:bg-zinc-800/60 dark:hover:bg-zinc-800/60 h-12 rounded-xl";
  const labelClasses = "text-sm font-medium text-zinc-700 dark:text-white/70 mb-1.5 block";

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-2xl text-zinc-900 dark:text-white font-medium mb-2">Message Sent!</h3>
        <p className="text-zinc-600 dark:text-white/70 text-center max-w-md">
          We've received your inquiry and will get back to you within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClasses}>Full Name *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={inputClasses}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelClasses}>Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClasses}
            placeholder="john@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClasses}>Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={inputClasses}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className={labelClasses}>Company Name</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className={inputClasses}
            placeholder="Your Company"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service" className={labelClasses}>Service Interested In *</Label>
          <ServiceDropdown
            value={formData.service}
            onChange={(service) => handleChange("service", service)}
          />
        </div>


      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className={labelClasses}>Project Details *</Label>
        <Textarea
          id="message"
          required
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className={`${inputClasses} min-h-[150px] resize-none`}
          placeholder="Tell us about your project, goals, and timeline..."
        />
      </div>

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-bold py-6 text-lg rounded-xl shadow-lg shadow-white/10"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Submitting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Submit Inquiry
          </span>
        )}
      </Button>

      <p className="text-white/40 text-sm text-center">
        By submitting this form, you agree to our privacy policy and terms of service.
      </p>
    </form>
  );
}
