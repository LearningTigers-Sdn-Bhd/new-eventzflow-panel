"use client";

import Phone from "@/components/devices/Phone";
import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const highlights = [
  { number: "01", text: "Works on any device" },
  { number: "02", text: "No app store needed" },
  { number: "03", text: "Add to home screen" },
  { number: "04", text: "Instant access" },
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
              Mobile-first experience
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-[320px] lg:ml-40">
              {/* Decorative elements */}
              <div className="absolute -left-32 top-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Web
                  <br />
                  based
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  PWA
                  <br />
                  ready
                </p>
              </div>

              {/* Phone */}
              <Phone>
                {/* Browser Bar */}
                <div className="border-b border-white/10 bg-[#1a1a1a] px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-400/80" />
                      <div className="h-2 w-2 rounded-full bg-yellow-400/80" />
                      <div className="h-2 w-2 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 rounded bg-white/10 px-3 py-1">
                      <p className="truncate text-[10px] text-white/60">
                        eventzflow.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* App Content */}
                <div className="flex flex-1 flex-col bg-gradient-to-b from-[#0a1014] to-black">
                  <div className="flex flex-1 flex-col items-center justify-center px-5 py-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white">
                      <span className="text-2xl font-bold text-black">E</span>
                    </div>
                    <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                      Welcome to
                    </p>
                    <p className="mt-1 text-center text-xl font-bold text-white">
                      EventzFlow
                    </p>
                  </div>

                  {/* Add to Home Screen Prompt */}
                  <div className="border-t border-white/10 bg-[#0a1014] p-4">
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                        <span className="text-base">📲</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs text-white">
                          Add to Home Screen
                        </p>
                        <p className="text-[10px] text-white/50">
                          For quick access
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                        <span className="text-sm">📋</span>
                        <p className="mt-1 text-[8px] text-white/50">Events</p>
                      </div>
                      <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                        <span className="text-sm">✓</span>
                        <p className="mt-1 text-[8px] text-white/50">Check-in</p>
                      </div>
                      <div className="rounded border border-white/10 bg-white/5 p-2 text-center">
                        <span className="text-sm">📊</span>
                        <p className="mt-1 text-[8px] text-white/50">Reports</p>
                      </div>
                    </div>

                    <p className="mt-3 text-center text-[9px] text-white/30">
                      Full features • No download
                    </p>
                  </div>
                </div>
              </Phone>
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
              EventzFlow runs directly in your browser - no app downloads
              required. Just open the link and you have full access to all
              features. Add it to your home screen for an app-like experience.
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
                  <span className="text-base font-medium text-black">
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
