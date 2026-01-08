"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const drawStyles = [
  {
    id: "wheel",
    name: "Spinning Wheel",
    description: "Classic prize wheel",
    image: "/images/services/lucky-draw/wheel.png",
  },
  {
    id: "slot",
    name: "Slot Machine",
    description: "Vegas-style slots",
    image: "/images/services/lucky-draw/slot.png",
  },
  {
    id: "box",
    name: "Mystery Box",
    description: "Surprise reveal",
    image: "/images/services/lucky-draw/box.png",
  },
];

const highlights = [
  { number: "01", text: "Animated draw experience" },
  { number: "02", text: "Multiple prize tiers" },
  { number: "03", text: "Live winner announcements" },
  { number: "04", text: "Full customization options" },
];

export default function ShowcaseSection() {
  const [selectedStyle, setSelectedStyle] = useState(drawStyles[0]);

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
              Exciting draw animations
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Draw Style Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="flex flex-col items-center"
          >
            {/* Preview Image */}
            <div className="relative mb-8 aspect-square w-full max-w-[400px] overflow-hidden border-2 border-black bg-muted/60">
              <Image
                src={selectedStyle.image}
                alt={selectedStyle.name}
                fill
                className="object-contain p-4"
              />
            </div>

            {/* Style Selector */}
            <div className="flex gap-2">
              {drawStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all ${
                    selectedStyle.id === style.id
                      ? "bg-black text-white"
                      : "border border-black/20 bg-white text-black hover:border-black"
                  }`}
                >
                  {style.name}
                </button>
              ))}
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
              Choose from three exciting draw styles to match your event vibe.
              Each animation is designed to build anticipation and create
              memorable moments for your attendees.
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
