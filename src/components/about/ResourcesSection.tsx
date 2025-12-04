import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Newspaper, BookOpen, Download, X, Loader2 } from "lucide-react";

interface Whitepaper {
  id: string;
  title: string;
  pdfUrl: string;
  downloadCount: number;
}

const staticResources = [
  {
    id: "case-studies",
    icon: FileText,
    title: "Case Studies",
    description: "Deep dives into our most impactful projects",
    link: "/projects",
  },
  {
    id: "whitepapers",
    icon: BookOpen,
    title: "Whitepapers",
    description: "Technical insights on production AI systems",
    link: "#",
    isWhitepaper: true,
  },
  {
    id: "press",
    icon: Newspaper,
    title: "Press & Media",
    description: "Latest news and industry recognition",
    link: "#",
  },
  {
    id: "blog",
    icon: FileText,
    title: "Technical Blog",
    description: "Engineering insights from our team",
    link: "/blog",
  },
];

export function ResourcesSection() {
  const [whitepaper, setWhitepaper] = useState<Whitepaper | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchWhitepaper();
  }, []);

  const fetchWhitepaper = async () => {
    try {
      const res = await fetch('/api/whitepapers');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setWhitepaper(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch whitepaper:', err);
    }
  };

  const handleDownload = async () => {
    if (!whitepaper) return;
    setDownloading(true);
    try {
      await fetch(`/api/whitepapers/${whitepaper.id}/download`, { method: 'POST' });
      window.open(whitepaper.pdfUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleResourceClick = (resource: typeof staticResources[0], e: React.MouseEvent) => {
    if (resource.isWhitepaper) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Resources & Recognition
          </h2>
          <p className="text-white/60 text-lg sm:text-xl">
            Explore our insights and industry presence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staticResources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.a
                key={resource.id}
                href={resource.link}
                onClick={(e) => handleResourceClick(resource, e)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg text-white mb-2">{resource.title}</h3>
                  <p className="text-white/60 text-sm flex-grow">{resource.description}</p>
                  <div className="mt-4 text-blue-400 text-sm flex items-center gap-2">
                    <span>Learn more</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Featured Whitepaper CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 sm:p-12 text-center">
            <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl sm:text-3xl text-white mb-4">
              {whitepaper?.title || "How We Deliver Production AI"}
            </h3>
            <p className="text-white/60 text-lg mb-6 max-w-2xl mx-auto">
              Download our comprehensive whitepaper on building reliable, scalable AI systems.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              disabled={downloading || !whitepaper}
              className="px-8 py-3.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Whitepaper
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Whitepaper Preview Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{whitepaper?.title || "Whitepaper"}</h3>
                    <p className="text-xs text-zinc-500">{whitepaper?.downloadCount || 0} downloads</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading || !whitepaper}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="flex-1 bg-zinc-950">
                {whitepaper?.pdfUrl ? (
                  <iframe
                    src={`${whitepaper.pdfUrl}#toolbar=0`}
                    className="w-full h-full"
                    title="Whitepaper Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-400">No whitepaper available yet</p>
                      <p className="text-sm text-zinc-500 mt-1">Check back soon</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
