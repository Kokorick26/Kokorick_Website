import { motion } from "motion/react";
import { ContactForm } from "./components/ContactForm";
import { Footer } from "./components/Footer";

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

export default function GetStartedPage() {
  return (
    <>
      {/* Contact Form */}
      <section className="min-h-screen flex items-center justify-center bg-black pt-24 pb-20 px-4">
        <div className="w-full max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl text-white mb-4 font-medium">
                  Tell Us About Your Project
                </h2>
                <p className="text-white/60 text-lg">
                  Fill out the form below and our team will reach out to discuss your needs
                </p>
              </div>

              <ContactForm />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <AnimatedSection>
        <section className="bg-black py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-white mb-12 text-center font-medium">
              What Happens Next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "We Review", desc: "Our team reviews your inquiry within 24 hours" },
                { step: "2", title: "We Connect", desc: "Schedule a call to discuss your project in detail" },
                { step: "3", title: "We Propose", desc: "Receive a tailored proposal with timeline and pricing" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl text-white font-medium mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.desc}</p>
                </div>
              ))}
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
