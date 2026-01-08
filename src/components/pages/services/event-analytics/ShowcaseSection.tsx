"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const highlights = [
  { number: "01", text: "Live attendance tracking" },
  { number: "02", text: "Visual charts and graphs" },
  { number: "03", text: "Detailed scan history" },
  { number: "04", text: "Location-based insights" },
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
              Your event at a glance
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative w-full max-w-[400px] lg:ml-40">
              {/* Decorative elements */}
              <div className="absolute -left-32 top-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Real-time
                  <br />
                  updates
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Export
                  <br />
                  anytime
                </p>
              </div>

              {/* Dashboard Mockup */}
              <motion.div
                className="relative border-2 border-black bg-white shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Dashboard Header */}
                <div className="border-b-2 border-black bg-black px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    Event Dashboard
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    AI Summit 2025
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 border-b border-black/10">
                  <div className="border-r border-black/10 p-4 text-center">
                    <p className="text-2xl font-black text-black">1,247</p>
                    <p className="text-xs font-medium uppercase tracking-widest text-black/40">
                      Registered
                    </p>
                  </div>
                  <div className="border-r border-black/10 p-4 text-center">
                    <p className="text-2xl font-black text-black">892</p>
                    <p className="text-xs font-medium uppercase tracking-widest text-black/40">
                      Checked In
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-2xl font-black text-black">71%</p>
                    <p className="text-xs font-medium uppercase tracking-widest text-black/40">
                      Attendance
                    </p>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="p-6">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-black/40">
                    Check-ins Today
                  </p>
                  {/* Simple Bar Chart */}
                  <div className="flex items-end justify-between gap-2 h-24">
                    {[40, 65, 85, 70, 90, 75, 60].map((height, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 bg-black"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.6,
                          delay: 0.5 + i * 0.1,
                          ease: SMOOTH_EASE,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-black/40">
                    <span>9AM</span>
                    <span>10AM</span>
                    <span>11AM</span>
                    <span>12PM</span>
                    <span>1PM</span>
                    <span>2PM</span>
                    <span>3PM</span>
                  </div>
                </div>

                {/* Location Stats */}
                <div className="border-t border-black/10 p-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Top Locations
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: "Main Hall", count: 342 },
                      { name: "Exhibition A", count: 287 },
                      { name: "Workshop Room", count: 156 },
                    ].map((loc) => (
                      <div key={loc.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black">{loc.name}</span>
                        <span className="text-sm text-black/60">{loc.count}</span>
                      </div>
                    ))}
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
              Get instant visibility into your event performance. Track
              attendance patterns, identify popular sessions, and make informed
              decisions with real-time data at your fingertips.
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
