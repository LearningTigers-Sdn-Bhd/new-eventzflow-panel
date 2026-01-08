"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const highlights = [
  { number: "01", text: "Self-registration via invite link" },
  { number: "02", text: "Complete booth information" },
  { number: "03", text: "Team member management" },
  { number: "04", text: "Visitor stamp tracking" },
];

export default function ShowcaseSection() {
  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="max-w-6xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                Live Demo
              </p>
            </div>
            <h2 className="font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Exhibitor booth portal
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Exhibitor Portal Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-[360px] lg:ml-40">
              {/* Decorative elements */}
              <div className="absolute -left-32 top-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Booth
                  <br />
                  details
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Team
                  <br />
                  members
                </p>
              </div>

              {/* Exhibitor Portal Mockup */}
              <motion.div
                className="relative border-2 border-black bg-white shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="border-b-2 border-black bg-black px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    Exhibitor Portal
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Tech Expo 2025
                  </p>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-4 border-b border-black/10 p-4">
                  <div className="flex h-14 w-14 items-center justify-center bg-black text-xl font-bold text-white">
                    TS
                  </div>
                  <div>
                    <p className="font-bold text-black">Tech Solutions Inc.</p>
                    <p className="text-sm text-black/60">Software & Cloud</p>
                  </div>
                </div>

                {/* Booth Details */}
                <div className="border-b border-black/10 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Booth Information
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Booth No.</span>
                      <span className="text-sm font-medium text-black">
                        A-101
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Type</span>
                      <span className="text-sm font-medium text-black">
                        Shell Scheme
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Fascia</span>
                      <span className="text-sm font-medium text-black">
                        Tech Solutions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Team Members (3/5)
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center bg-black text-xs font-bold text-white">
                        JD
                      </div>
                      <span className="text-sm text-black">John Doe</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center bg-black text-xs font-bold text-white">
                        SL
                      </div>
                      <span className="text-sm text-black">Sarah Lee</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center bg-black text-xs font-bold text-white">
                        MC
                      </div>
                      <span className="text-sm text-black">Mike Chen</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t-2 border-black p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black">
                      Booth Visits
                    </span>
                    <span className="bg-black px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                      127 Stamps
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: SMOOTH_EASE }}
          >
            <p className="mb-8 text-base leading-relaxed text-black/60 md:text-lg">
              Give exhibitors their own portal to manage booth details, add team
              members, and track visitor engagement. Self-service setup means
              less work for organizers.
            </p>

            {/* Highlights */}
            <div className="grid gap-1 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.1,
                    ease: SMOOTH_EASE,
                  }}
                  className="group flex items-center gap-4 border border-black/10 bg-black/[0.02] p-4 transition-colors hover:border-black/20 hover:bg-black/[0.05] md:p-5"
                >
                  <span className="font-bold text-xs tracking-widest text-black/40">
                    {item.number}
                  </span>
                  <span className="text-sm font-medium text-black">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
