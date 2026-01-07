"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Hosts Set Availability",
    description:
      "Exhibitors and sponsors define their available time slots for meetings.",
  },
  {
    number: "02",
    title: "Attendees Book Meetings",
    description:
      "Attendees browse hosts and book appointments at their preferred times.",
  },
  {
    number: "03",
    title: "Meet & Connect",
    description:
      "Both parties receive confirmations and meet at the scheduled time.",
  },
];

const smoothEase = [0.25, 0.46, 0.45, 0.94];

export default function HowItWorksSection() {
  return (
    <section className="bg-black px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              How It Works
            </p>
            <h2 className="font-bold text-4xl tracking-tight text-white md:text-5xl lg:text-6xl">
              Three simple steps
            </h2>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: smoothEase,
              }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-white md:block" />
              )}

              <div className="relative text-center">
                {/* Number */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-white bg-black">
                  <span className="font-bold text-xl text-white">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mb-3 font-bold text-xl text-white md:text-2xl">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60 md:text-base">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
