import { motion } from "motion/react";
import { Footer } from "./components/Footer";
import { ContainerScroll, CardSticky } from "./components/ui/card-sticky";
import {
  Brain,
  Code2,
  Rocket,
  Shield,
  Zap,
  Database,
  GitBranch,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

function AnimatedSection({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ServicesHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black to-blue-950/30" />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[1]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/80 to-transparent z-[5]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Our Services</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-white/90 leading-tight font-medium"
        >
          Build AI systems that
          <span className="block mt-3 text-blue-400 font-bold drop-shadow-sm">
            actually work in production
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-3xl mx-auto text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed mb-12"
        >
          From research prototypes to enterprise grade AI platforms, we handle the full stack.
        </motion.p>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  const services = [
    {
      icon: Brain,
      title: "AI Strategy & Consultancy",
      description: "We help startups, SMEs, enterprise teams, and even non technical clients understand what AI can truly do for their businesses. From demystifying AI capabilities to crafting a tailored roadmap, our consultancy guides you every step of the way, transforming possibilities into clear, actionable plans that drive growth and innovation.",
      features: [
        "Tailored AI roadmaps",
        "Capability assessment",
        "Growth strategy planning",
        "Non-technical guidance"
      ],
      color: "from-blue-500 to-cyan-500",
      hoverColor: "from-blue-600 to-cyan-600",
      shadowColor: "shadow-blue-500/20"
    },
    {
      icon: Rocket,
      title: "AI Agents & Agentic Automation",
      description: "Experience autonomous AI systems that think, plan, and act like real employees, working tirelessly to boost your business operations. Clients gain AI powered customer support agents, lead qualification and follow up agents, workflow automations, research and reporting bots, and streamlined business process automation.",
      features: [
        "24/7 AI employees",
        "Customer support agents",
        "Lead qualification bots",
        "Research & reporting"
      ],
      color: "from-orange-500 to-red-500",
      hoverColor: "from-orange-600 to-red-600",
      shadowColor: "shadow-orange-500/20"
    },
    {
      icon: Code2,
      title: "Custom LLM Development",
      description: "Get tailor made large language models built specifically for your business needs. From custom chatbots and knowledge base trained models to internal task assistants, document analysis, summarisation, and automated email writing tools. Our solutions deliver AI uniquely trained on your own data.",
      features: [
        "Custom chatbots",
        "Knowledge base models",
        "Document analysis",
        "Automated writing tools"
      ],
      color: "from-purple-500 to-pink-500",
      hoverColor: "from-purple-600 to-pink-600",
      shadowColor: "shadow-purple-500/20"
    },
    {
      icon: Zap,
      title: "AI Workflow Automation",
      description: "Transform slow, manual processes into fast, automated workflows that boost efficiency and reduce errors. Automate CRM updates, email campaigns, data extraction, report generation, and HR/recruitment tasks effortlessly. Unlock the future of productivity with automation designed to work smarter, faster, and 24/7.",
      features: [
        "CRM automation",
        "Data extraction",
        "Report generation",
        "HR & recruitment tasks"
      ],
      color: "from-green-500 to-emerald-500",
      hoverColor: "from-green-600 to-emerald-600",
      shadowColor: "shadow-green-500/20"
    },
    {
      icon: GitBranch,
      title: "AI Integration for Existing Systems",
      description: "Seamlessly embed AI into the tools your business already relies on. From CRMs like HubSpot, Salesforce, and Zoho to ERPs, websites, internal dashboards, databases, and APIs. This smooth integration boosts efficiency, automates workflows, and delivers smarter insights without disrupting your current operations.",
      features: [
        "CRM & ERP integration",
        "Dashboard enhancement",
        "API connectivity",
        "Seamless embedding"
      ],
      color: "from-indigo-500 to-purple-500",
      hoverColor: "from-indigo-600 to-purple-600",
      shadowColor: "shadow-indigo-500/20"
    },
    {
      icon: Shield,
      title: "Computer Vision Solutions",
      description: "Harness AI that sees, detects, tracks, and analyses images and videos with precision. Applications include object detection, inventory tracking, security and surveillance, quality control automation, and facial recognition. Our service stands out as very few UK agencies offer specialised Computer Vision solutions.",
      features: [
        "Object detection",
        "Inventory tracking",
        "Quality control",
        "Facial recognition"
      ],
      color: "from-yellow-500 to-orange-500",
      hoverColor: "from-yellow-600 to-orange-600",
      shadowColor: "shadow-yellow-500/20"
    },
    {
      icon: Sparkles,
      title: "Deep Learning Model Development",
      description: "Build advanced neural networks tailored to solve your business’s most complex challenges. Our deep learning solutions excel in prediction models, recommendation systems, forecasting, pattern recognition, and behaviour analysis. Harness the power of deep learning to gain accurate forecasts and actionable insights.",
      features: [
        "Prediction models",
        "Recommendation systems",
        "Pattern recognition",
        "Behavior analysis"
      ],
      color: "from-rose-500 to-red-500",
      hoverColor: "from-rose-600 to-red-600",
      shadowColor: "shadow-rose-500/20"
    },
    {
      icon: Database,
      title: "Data Engineering & Pipeline Setup",
      description: "Build clean, organised, and automated data pipelines that power smarter AI. Our services include data cleaning, transformation, API based ingestion, database setup, and rigorous data quality assurance. Efficient pipelines ensure your AI models train on reliable, high quality data.",
      features: [
        "Data cleaning & transformation",
        "API ingestion",
        "Database setup",
        "Quality assurance"
      ],
      color: "from-cyan-500 to-blue-500",
      hoverColor: "from-cyan-600 to-blue-600",
      shadowColor: "shadow-cyan-500/20"
    }
  ];

  return (
    <>
      <ServicesHero />

      {/* Services Sticky Cards */}
      <section className="bg-black py-20 px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-medium">
              Comprehensive AI Solutions
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale intelligent systems
            </p>
          </div>
        </AnimatedSection>

        <ContainerScroll className="py-20">
          {services.map((service, i) => (
            <CardSticky
              key={i}
              index={i}
              incrementY={30}
              incrementZ={10}
              offsetTop="15vh"
              className="mb-6 flex justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group w-full"
              >
                <div className="relative p-6 md:p-8 rounded-3xl bg-[#0d1220] border border-white/10 transition-all duration-300 overflow-hidden">
                  {/* Content */}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-blue-500/30">
                      <service.icon className="w-6 h-6 text-blue-400" />
                    </div>

                    <h3 className="text-2xl text-white font-bold mb-3">{service.title}</h3>
                    <p className="text-white/90 mb-6 leading-relaxed text-base">{service.description}</p>

                    <ul className="space-y-3">
                      {service.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3 text-white/80">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </CardSticky>
          ))}
        </ContainerScroll>
      </section>

      {/* Process Section */}
      <section className="bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4 font-medium">
                Our Process
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                From concept to deployment in four streamlined phases
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "Understand your needs and define success metrics" },
              { step: "02", title: "Design", desc: "Architecture planning and technical specification" },
              { step: "03", title: "Development", desc: "Agile sprints with continuous feedback" },
              { step: "04", title: "Deployment", desc: "Launch, monitor, and iterate for success" }
            ].map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <div className="text-6xl font-bold text-white/10 mb-4">{phase.step}</div>
                  <h3 className="text-2xl text-white font-medium mb-3">{phase.title}</h3>
                  <p className="text-white/60">{phase.desc}</p>
                  {i < 3 && (
                    <ArrowRight className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500/50" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection>
        <section className="bg-black py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 backdrop-blur-sm">
              <Zap className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl text-white mb-4 font-medium">
                Ready to build something amazing?
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
                Let's discuss your project and see how we can help bring your AI vision to life.
              </p>
              <motion.button
                className="px-10 py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.history.pushState({}, "", '/get-started');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Start a conversation
              </motion.button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <Footer />
      </AnimatedSection>
    </>
  );
}
