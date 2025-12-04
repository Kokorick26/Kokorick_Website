import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

interface ServiceDropdownProps {
  value: string;
  onChange: (service: string) => void;
}

const serviceOptions = [
  { value: "ai-research", label: "AI Research & Development" },
  { value: "full-stack", label: "Full-Stack AI Engineering" },
  { value: "agentic", label: "Agentic AI Systems" },
  { value: "rag", label: "RAG & Knowledge Systems" },
  { value: "safety", label: "AI Safety & Evaluation" },
  { value: "mlops", label: "MLOps & Infrastructure" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" }
];

export function ServiceDropdown({ value, onChange }: ServiceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentService = serviceOptions.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/40 border border-zinc-700 text-white font-medium hover:bg-zinc-800/60 transition-colors h-12"
      >
        <span className="text-sm text-left">{currentService?.label || "Select a service"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {serviceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                    value === option.value
                      ? "bg-white text-black font-medium border border-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
