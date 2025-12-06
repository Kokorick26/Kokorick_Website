import { motion } from "motion/react";
import { Lightbulb, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ReactNode } from "react";

const pillars = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "Research grade thinking, production grade rigor.",
  },
  {
    icon: Shield,
    title: "Trust & Explainability",
    description: "Auditable, interpretable, safe systems.",
  },
  {
    icon: Zap,
    title: "Performance by Design",
    description: "Optimized for reliability and cost-efficiency.",
  },
];

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div aria-hidden className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />
    <div className="bg-black absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l border-white/20">{children}</div>
  </div>
);

export function VisionSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 bg-black overflow-x-hidden">
      <div className="@container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl text-white">
            Vision & Philosophy
          </h2>
          <p className="mt-4 text-white/60">
            Our core principles that guide how we build intelligent systems
          </p>
        </motion.div>

        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="group border-0 bg-white/5 backdrop-blur-sm shadow-none hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardDecorator>
                      <Icon className="size-6 text-white" aria-hidden />
                    </CardDecorator>

                    <h3 className="mt-6 text-white">{pillar.title}</h3>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-white/60">{pillar.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
