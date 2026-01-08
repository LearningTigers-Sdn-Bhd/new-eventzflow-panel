"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const features = [
  {
    title: "EXHIBITOR PROFILES",
    description:
      "Each exhibitor gets a complete profile with company details, logo, and contact information.",
  },
  {
    title: "BOOTH SETUP",
    description:
      "Configure booth numbers, types, fascia names, and dimensions for every exhibitor.",
  },
  {
    title: "TEAM MEMBERS",
    description:
      "Exhibitors can add their team members with configurable limits per booth.",
  },
  {
    title: "EASY INVITATIONS",
    description:
      "Generate invite links so exhibitors can self-register and set up their own profiles.",
  },
  {
    title: "EXHIBITOR DASHBOARD",
    description:
      "Give exhibitors their own portal to view stats and manage their booth information.",
  },
  {
    title: "VISITOR STAMPS",
    description:
      "Track which attendees visited each booth with digital stamp collection.",
  },
];

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
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="max-w-6xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                Capabilities
              </p>
            </div>
            <h2 className="font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Empower your exhibitors
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
                className={`group relative flex min-h-[220px] flex-col justify-between border p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl md:min-h-[280px] md:p-10 ${
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
                  className={`relative z-10 text-base leading-relaxed md:text-lg ${
                    isBlackCard ? "text-white/70" : "text-black/70"
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
