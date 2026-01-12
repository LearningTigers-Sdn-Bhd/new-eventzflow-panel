"use client";

import { motion } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function CTASection() {
  return (
    <section className="bg-black px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: SMOOTH_EASE }}
        >
          {/* Decorative line */}
          <div className="mx-auto mb-8 h-px w-16 bg-white/30" />

          <h2 className="mb-6 font-bold text-3xl tracking-tight text-white md:text-4xl lg:text-5xl">
            Ready to excite your audience?
          </h2>
          <p className="mb-10 text-base text-white/60 md:text-lg">
            Create memorable moments with interactive lucky draws that keep
            attendees engaged and entertained.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href={"/auth?login" as Route}>
              <motion.button
                className="w-full border border-white bg-white px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-[#23c460] hover:border-[#23c460] hover:text-white sm:w-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Get Started Free
              </motion.button>
            </Link>
            <Link href={"/contact" as Route}>
              <motion.button
                className="w-full border border-white/30 bg-transparent px-10 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all hover:border-[#2766ec] hover:bg-[#2766ec] sm:w-auto"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Contact Sales
              </motion.button>
            </Link>
          </div>

          {/* Decorative line */}
          <div className="mx-auto mt-12 h-px w-16 bg-white/30" />
        </motion.div>
      </div>
    </section>
  );
}
