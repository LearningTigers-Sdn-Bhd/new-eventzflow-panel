"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "QR CODE SCANNING",
    description:
      "Fast contactless check-in by scanning attendee QR codes with any device.",
  },
  {
    title: "BADGE PRINTING",
    description:
      "Print professional name badges on-demand as attendees check in at your event.",
  },
  {
    title: "MULTI-DEVICE SUPPORT",
    description:
      "Check in attendees from phones, tablets, or laptops — use any device you have.",
  },
  {
    title: "REAL-TIME TRACKING",
    description:
      "Monitor attendance in real-time with live dashboards and instant notifications.",
  },
  {
    title: "CUSTOM BADGE DESIGNS",
    description:
      "Design badges with your branding, logos, and custom fields for each ticket type.",
  },
  {
    title: "WALK-IN REGISTRATION",
    description:
      "Register and check in walk-in attendees on the spot with instant badge printing.",
  },
];

const smoothEase = [0.25, 0.46, 0.45, 0.94];

export default function FeaturesSection() {
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
                Capabilities
              </p>
            </div>
            <h2 className="font-black text-5xl uppercase tracking-tighter text-black md:text-6xl lg:text-7xl">
              Everything you need for smooth check-in
            </h2>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const isBlackCard = index % 2 === 0;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -12,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`group relative flex min-h-[280px] flex-col justify-between border p-10 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl ${
                  isBlackCard
                    ? "border-white/20 bg-black hover:border-white"
                    : "border-black/20 bg-white hover:border-black"
                }`}
              >
                <div className="relative z-10">
                  <span
                    className={`font-bold text-xs tracking-widest ${
                      isBlackCard ? "text-white/40" : "text-black/40"
                    }`}
                  >
                    0{index + 1}
                  </span>
                  <h3
                    className={`mt-6 font-black text-2xl leading-tight tracking-tight ${
                      isBlackCard ? "text-white" : "text-black"
                    }`}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p
                  className={`relative z-10 text-sm leading-relaxed ${
                    isBlackCard ? "text-white/60" : "text-black/60"
                  }`}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
