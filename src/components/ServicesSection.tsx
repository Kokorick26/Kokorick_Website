"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { Shield, Brain, Code, Database, Zap } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1] as any,
    },
  }),
};

export function ServicesSection() {
  return (
    <section className="bg-black py-16 md:py-24 overflow-x-hidden">
      <div className="mx-auto max-w-3xl lg:max-w-5xl xl:max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Turning intelligence into action with smarter, adaptive AI systems.
          </h2>
          <p className="text-white/50 text-lg">
            Discover tailored AI solutions that unlock growth and innovation for your business. From strategy and custom AI models to automation and data engineering, we empower you with cutting edge technology. Transform your operations with AI designed to deliver real, measurable impact.
          </p>
        </motion.div>

        <div className="relative">
          <div className="relative z-10 grid grid-cols-6 gap-3">
            {/* Card 1: Research-Driven AI */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              className="relative col-span-full flex overflow-hidden lg:col-span-2"
            >
              <Card className="relative w-full flex overflow-hidden bg-black border-white/10 hover:bg-white/5 transition-colors duration-300">
                <CardContent className="relative m-auto size-fit pt-4 p-4">
                  <div className="relative flex h-16 w-40 items-center">
                    <svg className="text-white/10 absolute inset-0 size-full" viewBox="0 0 254 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M112.891 97.7022C140.366 97.0802 171.004 94.6715 201.087 87.5116C210.43 85.2881 219.615 82.6412 228.284 78.2473C232.198 76.3179 235.905 73.9942 239.348 71.3124C241.85 69.2557 243.954 66.7571 245.555 63.9408C249.34 57.3235 248.281 50.5341 242.498 45.6109C239.033 42.7237 235.228 40.2703 231.169 38.3054C219.443 32.7209 207.141 28.4382 194.482 25.534C184.013 23.1927 173.358 21.7755 162.64 21.2989C161.376 21.3512 160.113 21.181 158.908 20.796C158.034 20.399 156.857 19.1682 156.962 18.4535C157.115 17.8927 157.381 17.3689 157.743 16.9139C158.104 16.4588 158.555 16.0821 159.067 15.8066C160.14 15.4683 161.274 15.3733 162.389 15.5286C179.805 15.3566 196.626 18.8373 212.998 24.462C220.978 27.2494 228.798 30.4747 236.423 34.1232C240.476 36.1159 244.202 38.7131 247.474 41.8258C254.342 48.2578 255.745 56.9397 251.841 65.4892C249.793 69.8582 246.736 73.6777 242.921 76.6327C236.224 82.0192 228.522 85.4602 220.502 88.2924C205.017 93.7847 188.964 96.9081 172.738 99.2109C153.442 101.949 133.993 103.478 114.506 103.79C91.1468 104.161 67.9334 102.97 45.1169 97.5831C36.0094 95.5616 27.2626 92.1655 19.1771 87.5116C13.839 84.5746 9.1557 80.5802 5.41318 75.7725C-0.54238 67.7259 -1.13794 59.1763 3.25594 50.2827C5.82447 45.3918 9.29572 41.0315 13.4863 37.4319C24.2989 27.5721 37.0438 20.9681 50.5431 15.7272C68.1451 8.8849 86.4883 5.1395 105.175 2.83669C129.045 0.0992292 153.151 0.134761 177.013 2.94256C197.672 5.23215 218.04 9.01724 237.588 16.3889C240.089 17.3418 242.498 18.5197 244.933 19.6446C246.627 20.4387 247.725 21.6695 246.997 23.615C246.455 25.1105 244.814 25.5605 242.63 24.5811C230.322 18.9961 217.233 16.1904 204.117 13.4376C188.761 10.3438 173.2 8.36665 157.558 7.52174C129.914 5.70776 102.154 8.06792 75.2124 14.5228C60.6177 17.8788 46.5758 23.2977 33.5102 30.6161C26.6595 34.3329 20.4123 39.0673 14.9818 44.658C12.9433 46.8071 11.1336 49.1622 9.58207 51.6855C4.87056 59.5336 5.61172 67.2494 11.9246 73.7608C15.2064 77.0494 18.8775 79.925 22.8564 82.3236C31.6176 87.7101 41.3848 90.5291 51.3902 92.5804C70.6068 96.5773 90.0219 97.7419 112.891 97.7022Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="mx-auto block w-fit text-3xl text-white">AI</span>
                  </div>
                  <h2 className="mt-4 text-center text-xl text-white">Research-Driven</h2>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Production-Ready */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2"
            >
              <Card className="relative w-full h-full overflow-hidden bg-black border-white/10 hover:bg-white/5 transition-colors duration-300">
                <CardContent className="pt-4 p-4">
                  <div className="relative mx-auto flex aspect-square size-24 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-white/10 before:border-white/5">
                    <Shield className="m-auto h-10 w-10 text-white" strokeWidth={1} />
                  </div>
                  <div className="relative z-10 mt-4 space-y-2 text-center">
                    <h2 className="text-lg text-white">Production Ready</h2>
                    <p className="text-white/50 text-sm">Scalable systems built to handle real world complexity and deliver reliable performance at scale.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Full-Stack with simple waves */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2"
            >
              <Card className="relative w-full h-full overflow-hidden bg-black border-white/10 hover:bg-white/5 transition-colors duration-300">
                <CardContent className="pt-4 p-4">
                  <div className="pt-4 px-4">
                    <div className="h-16 w-full flex items-center justify-center">
                      <svg className="w-full h-12" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Multiple wavy lines */}
                        <path
                          d="M0 40 Q 25 20, 50 40 T 100 40 T 150 40 T 200 40"
                          stroke="white"
                          strokeWidth="2"
                          strokeOpacity="0.3"
                          fill="none"
                        />
                        <path
                          d="M0 50 Q 25 35, 50 50 T 100 50 T 150 50 T 200 50"
                          stroke="white"
                          strokeWidth="2"
                          strokeOpacity="0.2"
                          fill="none"
                        />
                        <path
                          d="M0 60 Q 25 48, 50 60 T 100 60 T 150 60 T 200 60"
                          stroke="white"
                          strokeWidth="2"
                          strokeOpacity="0.15"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 space-y-2 text-center">
                    <h2 className="text-lg text-white">Full Stack</h2>
                    <p className="text-white/50 text-sm">End to end solutions from backend infrastructure to intelligent frontends.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4: Agentic AI Platforms - larger card */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              className="relative col-span-full overflow-hidden lg:col-span-3"
            >
              <Card className="relative w-full h-full overflow-hidden bg-black border-white/10 hover:bg-white/5 transition-colors duration-300">
                <CardContent className="grid pt-4 p-4 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-6 lg:space-y-4">
                    <div className="relative flex aspect-square size-10 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-white/10 before:border-white/5">
                      <Brain className="m-auto size-5 text-white" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg text-white">Agentic AI Platforms</h2>
                      <p className="text-white/50 text-sm">Intelligent systems that reason, plan, and execute complex workflows autonomously.</p>
                    </div>
                  </div>
                  <div className="relative mt-4 sm:-my-4 sm:-mr-4">
                    <div className="h-full flex items-center justify-center p-4">
                      <svg className="w-full h-24" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Simple ascending line chart */}
                        <path
                          d="M10 90 L30 80 L50 70 L70 55 L90 50 L110 45 L130 35 L150 30 L170 20 L190 15"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Gradient fill under the line */}
                        <path
                          d="M10 90 L30 80 L50 70 L70 55 L90 50 L110 45 L130 35 L150 30 L170 20 L190 15 L190 100 L10 100 Z"
                          fill="url(#gradient-chart)"
                          opacity="0.2"
                        />
                        {/* Data points */}
                        <circle cx="10" cy="90" r="3" fill="#3b82f6" />
                        <circle cx="50" cy="70" r="3" fill="#3b82f6" />
                        <circle cx="90" cy="50" r="3" fill="#3b82f6" />
                        <circle cx="130" cy="35" r="3" fill="#3b82f6" />
                        <circle cx="170" cy="20" r="3" fill="#3b82f6" />
                        <defs>
                          <linearGradient id="gradient-chart" x1="100" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 5: Deep Learning Expertise - larger card */}
            <motion.div
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={cardVariants}
              className="relative col-span-full overflow-hidden lg:col-span-3"
            >
              <Card className="relative w-full h-full overflow-hidden bg-black border-white/10 hover:bg-white/5 transition-colors duration-300">
                <CardContent className="grid h-full pt-4 p-4 sm:grid-cols-2">
                  <div className="relative z-10 flex flex-col justify-between space-y-6 lg:space-y-4">
                    <div className="relative flex aspect-square size-10 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border border-white/10 before:border-white/5">
                      <svg className="m-auto size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                        <path d="m6.08 9.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
                        <path d="m6.08 14.5-3.5 1.6a1 1 0 0 0 0 1.81l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9a1 1 0 0 0 0-1.83l-3.5-1.59" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg text-white">Deep Learning Expertise</h2>
                      <p className="text-white/50 text-sm">Computer vision, NLP, and custom neural architectures for production challenges.</p>
                    </div>
                  </div>
                  <div className="before:bg-white/10 relative mt-4 before:absolute before:inset-0 before:mx-auto before:w-px sm:-my-4 sm:-mr-4">
                    <div className="relative flex h-full flex-col justify-center space-y-4 py-4">
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-white/10 px-2 py-1 text-[10px] text-white/70">Computer Vision</span>
                        <div className="ring-black size-6 ring-2 bg-blue-500 rounded-full flex items-center justify-center">
                          <Code className="size-3 text-white" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="relative ml-[calc(50%-1rem)] flex items-center gap-2">
                        <div className="ring-black size-7 ring-2 bg-purple-500 rounded-full flex items-center justify-center">
                          <Database className="size-3 text-white" strokeWidth={2} />
                        </div>
                        <span className="block h-fit rounded border border-white/10 px-2 py-1 text-[10px] text-white/70">Neural Networks</span>
                      </div>
                      <div className="relative flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
                        <span className="block h-fit rounded border border-white/10 px-2 py-1 text-[10px] text-white/70">NLP</span>
                        <div className="ring-black size-6 ring-2 bg-green-500 rounded-full flex items-center justify-center">
                          <Zap className="size-3 text-white" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
