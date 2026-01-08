"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const highlights = [
  { number: "01", text: "Easy booking interface" },
  { number: "02", text: "Automatic confirmations" },
  { number: "03", text: "Calendar integration" },
  { number: "04", text: "Meeting reminders" },
];

const timeSlots = [
  { time: "09:00 AM", status: "booked", name: "John Smith" },
  { time: "10:00 AM", status: "available", name: null },
  { time: "11:00 AM", status: "booked", name: "Sarah Lee" },
  { time: "02:00 PM", status: "available", name: null },
  { time: "03:00 PM", status: "booked", name: "Mike Chen" },
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
              Simple booking experience
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Booking Interface Mockup */}
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
                  Real-time
                  <br />
                  availability
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Instant
                  <br />
                  booking
                </p>
              </div>

              {/* Booking Interface Mockup */}
              <motion.div
                className="relative border-2 border-black bg-white shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Header */}
                <div className="border-b-2 border-black bg-black px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    Book a Meeting
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Tech Solutions Inc.
                  </p>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-4 border-b border-black/10 p-4">
                  <div className="flex h-12 w-12 items-center justify-center bg-black text-lg font-bold text-white">
                    TS
                  </div>
                  <div>
                    <p className="font-bold text-black">David Wong</p>
                    <p className="text-sm text-black/60">Sales Director</p>
                  </div>
                </div>

                {/* Date Selector */}
                <div className="border-b border-black/10 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Select Date
                  </p>
                  <div className="flex gap-2">
                    {["Mon 15", "Tue 16", "Wed 17"].map((day, i) => (
                      <button
                        key={day}
                        type="button"
                        className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                          i === 1
                            ? "bg-black text-white"
                            : "border border-black/20 text-black hover:border-black"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-black/40">
                    Available Slots
                  </p>
                  <div className="space-y-2">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.time}
                        className={`flex items-center justify-between p-3 ${
                          slot.status === "available"
                            ? "border border-black/20 hover:border-black cursor-pointer"
                            : "bg-black/5"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            slot.status === "available"
                              ? "text-black"
                              : "text-black/40"
                          }`}
                        >
                          {slot.time}
                        </span>
                        {slot.status === "available" ? (
                          <span className="text-xs font-bold uppercase tracking-widest text-black/60">
                            Available
                          </span>
                        ) : (
                          <span className="text-xs text-black/40">
                            {slot.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <div className="border-t-2 border-black p-4">
                  <button
                    type="button"
                    className="w-full bg-black py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-black/80"
                  >
                    Book Selected Slot
                  </button>
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
              Make it easy for attendees to connect with the right people.
              Hosts set their availability, attendees pick a time, and both
              parties get instant confirmations.
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
