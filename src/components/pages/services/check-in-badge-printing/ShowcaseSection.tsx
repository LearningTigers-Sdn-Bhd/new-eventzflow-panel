"use client";

import { motion } from "framer-motion";

const highlights = [
  { number: "01", text: "Under 3 seconds per check-in" },
  { number: "02", text: "Works with any device camera" },
  { number: "03", text: "Badges print automatically" },
  { number: "04", text: "Real-time attendance sync" },
];

const smoothEase = [0.25, 0.46, 0.45, 0.94];

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
            transition={{ duration: 0.8, ease: smoothEase }}
            className="max-w-6xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                Live Demo
              </p>
            </div>
            <h2 className="font-black text-5xl uppercase tracking-tighter text-black md:text-6xl lg:text-7xl">
              Seamless check-in experience
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Badge Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative ml-40 max-w-[320px]">
              {/* Decorative elements */}
              <div className="absolute -left-32 top-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Scan QR
                  <br />
                  in seconds
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Print badge
                  <br />
                  instantly
                </p>
              </div>

              {/* Badge Mockup */}
              <motion.div
                className="relative bg-white border-2 border-black shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Badge Header */}
                <div className="bg-black px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    SME Expo 2025
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Sabah International Convention Centre
                  </p>
                </div>

                {/* Badge Content */}
                <div className="p-6">
                  {/* Avatar */}
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center bg-black text-2xl font-bold text-white">
                      JS
                    </div>
                    <div>
                      <p className="text-2xl font-black text-black">John Smith</p>
                      <p className="text-sm text-black/60">Executive</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 border-t border-black/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-widest text-black/40">
                        Company
                      </span>
                      <span className="text-sm font-medium text-black">
                        Tech Corp
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs font-medium uppercase tracking-widest text-black/40">
                        Ticket
                      </span>
                      <span className="text-sm font-medium text-black">
                        VIP Pass
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-black/5 p-3">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 0h7v7H0zM8 0h1v1H8zM10 0h1v1h-1zM12 0h2v1h-2zM15 0h1v2h-1zM17 0h5v1h-1v1h-1V1h-1v1h-1V1h-1zM22 0h7v7h-7zM1 1v5h5V1zM9 1h1v1H9zM11 1h1v2h1V2h2v1h-1v1h-2v1h-1V4h1V3h-1zM16 1v1h-1v1h2V2h1v2h-2v1h1v1h-2v1h1v1h-1v1h2V8h2v1h-1v2h1v-1h2V9h-2V8h1V7h-1V6h2V5h-1V4h1V3h-2V2h1V1h-3v1h-1v1h-1zM23 1v5h5V1zM2 2v3h3V2zM18 2h1v1h-1zM23 2v3h3V2zM10 3h1v1h-1zM9 4v1H8v2h1V6h1v1h2v1h-1v1H9V8h1V7H9V6H8v1H7v1h1v1H7v2H6v-2H5v1H4v2H3v1h1v-1h2v1h1v1H6v1h2v1H7v2H6v-1H4v1H3v1h1v1H3v1h2v1H4v-1H3v-1H2v1H1v1H0v-2h1v-1h1v-2h1v1H2v1h1v-2h1v1h1v2h1v-2H5v-1h1v-2H5v-1H4v-2H3v1H2v-2H1v-1H0V8h1V7h1V6h1v1h2V6H4v1h1V6h1v1h2V6h1zM20 4h1v1h-1zM21 5v1h-2v1h2v1h-3V7h1V6h1V5zM27 5h1v1h-1zM11 6h1v1h-1zM3 7v1H2V7zM5 7h1v2H5zM26 7h2v2h-2zM14 8h1v1h-1zM6 9h1v1H6zM23 9h1v2h1v-1h1v1h-1v1h2v1h-3v-1h-1v1h-1v-1h1v-2h-1v1h-1v-1h1V9h1zM27 9v3h-1v-1h-1v-1h2zM3 10v1H2v-1zM9 10h2v1h1v-1h1v2h-1v-1h-1v1H9v1h1v-1h2v2h-2v1h3v1h-1v1h1v1h-1v2h1v-1h2v1h1v-1h1v1h1v2h-1v-1h-3v2h1v1h1v1h-1v-1h-2v1h1v1H9v1h1v1H9v1h2v-2h1v2h-1v1h2v-2h1v1h2v1h-1v1h4v-1h-1v-1h-1v-2h-1v1h-2v-2h2v-1h2v2h-1v2h2v-1h2v-1h-1v-2h-1v1h-2v-2h1v-1h-1v-2h1v1h2v-2h-1v-1h1v-1h-2v-1h-1v-1h-1v-1h1v-1h-2v1h-1v-2h2v-1h-2v1h-2v-1h1V9h-2v1h-1V9h-2v1h1v1h-2v1h1v1h1v1h-1v-1h-2v-1h1v-2h-1v1H9v1h1v-1h2v1h-2v1h-1zM4 11h1v1H4zM6 11h1v1H6zM27 12h2v1h-1v1h-1zM10 13h1v1h-1zM0 14h1v1H0zM2 14h2v1H2zM5 14h2v2H6v-1H5zM1 15h1v1H1zM4 15h1v2H4zM18 15h1v1h-1zM28 15h1v3h-1zM0 16h1v2H0zM2 16h1v1H2zM22 16h2v1h-2zM25 16h1v1h-1zM1 17h1v1H1zM21 17h1v2h-2v-1h1zM24 17h1v1h-1zM26 17h1v1h-1zM6 18v1H5v1h2v-1h1v1H7v1h2v-1h1v1H9v2h1v-1h1v-1h-1v-1h2v-1h-1v-1h-1v-1H9v1H8v-1H7v1H6zM18 18h1v1h1v-1h2v1h-1v1h-1v2h-1v-1h-2v1h1v1h-2v-1h1v-2h2v-1h-1zM3 19h1v1H3zM23 19h1v1h-1zM25 19h2v1h-2zM15 20h1v1h-1zM24 20h1v1h-1zM1 21h2v1H1zM4 21h1v1H4zM0 22h1v7H0zM7 22h1v1H7zM14 22h1v2h-1zM22 22h7v7h-7zM1 23h1v1H1zM3 23h3v1h1v1H6v2H5v-1H4v-1H3v2H2v-3h1zM15 23h1v1h-1zM23 23v5h5v-5zM7 24h1v2H7zM1 25h1v2H1zM24 24v3h3v-3zM8 26h4v1h1v-1h1v1h-5v1h5v1h-6zM2 27h3v1H2zM0 28h1v1H0zM7 28h1v1H7z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="border-t-2 border-black bg-black/5 px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                      Day 1 - AI Summit
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
            transition={{ duration: 0.8, delay: 0.2, ease: smoothEase }}
          >
            <p className="mb-8 text-base leading-relaxed text-black/60 md:text-lg">
              Scan attendee QR codes and print professional badges in seconds.
              Our check-in system handles high-volume events with ease, keeping
              queues moving and attendees happy.
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
                    ease: smoothEase,
                  }}
                  className="group flex items-center gap-4 border border-black/10 bg-black/[0.02] p-5 transition-colors hover:border-black/20 hover:bg-black/[0.05]"
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
