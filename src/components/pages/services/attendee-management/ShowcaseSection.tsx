"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const highlights = [
  { number: "01", text: "Custom registration fields" },
  { number: "02", text: "Unique QR codes per attendee" },
  { number: "03", text: "Booth visit tracking" },
  { number: "04", text: "Bulk import support" },
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
              Complete attendee profiles
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Attendee Profile Mockup */}
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
                  Complete
                  <br />
                  profiles
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Custom
                  <br />
                  fields
                </p>
              </div>

              {/* Attendee Profile Mockup */}
              <motion.div
                className="relative border-2 border-black bg-white shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="border-b-2 border-black bg-black px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    Attendee Profile
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Tech Summit 2025
                  </p>
                </div>

                {/* Attendee Info */}
                <div className="flex items-center gap-4 border-b border-black/10 p-4">
                  <div className="flex h-14 w-14 items-center justify-center bg-black text-xl font-bold text-white">
                    JD
                  </div>
                  <div>
                    <p className="font-bold text-black">Jane Doe</p>
                    <p className="text-sm text-black/60">Senior Developer</p>
                    <p className="text-xs text-black/40">Acme Corporation</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Contact Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Email</span>
                      <span className="text-sm font-medium text-black">
                        jane@acme.com
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Phone</span>
                      <span className="text-sm font-medium text-black">
                        +60 12-345 6789
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="border-t border-black/10 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Additional Info
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Company</span>
                      <span className="text-sm font-medium text-black">
                        Acme Corporation
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black/60">Role</span>
                      <span className="text-sm font-medium text-black">
                        Speaker
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="border-t-2 border-black p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black">
                      Status
                    </span>
                    <span className="bg-black px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
                      Checked In
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
              Access complete attendee information at a glance. View contact
              details, custom fields, and registration status all from a
              central dashboard.
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
