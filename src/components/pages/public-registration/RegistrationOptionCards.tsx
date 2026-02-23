"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicRegistrationFormItem } from "@/lib/api/public-registration";

const SMOOTH_EASE = [0.16, 1, 0.3, 1];

export function RegistrationOptionCards({
  eventSlug,
  forms,
}: {
  eventSlug: string;
  forms: PublicRegistrationFormItem[];
}) {
  // All cards white with offset shadow on hover
  const cardStyle = "bg-white border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {forms.map((form, index) => (
        <motion.article
          key={form.slug}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            y: -4,
            x: -4,
            transition: { duration: 0.2, ease: "easeOut" },
          }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: SMOOTH_EASE,
          }}
          className={`group relative flex min-h-[280px] flex-col justify-between overflow-hidden border-2 p-8 transition-all duration-200 ease-out md:min-h-[320px] md:p-10 ${cardStyle}`}
        >
          {/* Number indicator */}
          <div className="relative z-10">
            <span className="font-bold text-xs tracking-widest text-black/40">
              0{index + 1}
            </span>

            {/* Title */}
            <h2 className="mt-4 font-black text-2xl md:text-3xl leading-none tracking-tighter text-black">
              {form.name.split(" ").map((word, idx) => (
                <span key={idx} className="block">
                  {word}
                </span>
              ))}
            </h2>
          </div>

          {/* Description and CTA */}
          <div className="relative z-10">
            {form.description ? (
              <p className="text-base leading-relaxed text-black/70 mb-6">
                {form.description}
              </p>
            ) : (
              <div className="mb-6" />
            )}

            {/* CTA Button */}
            <Link
              href={`/events/${encodeURIComponent(eventSlug)}/register/${encodeURIComponent(form.slug)}`}
              className="inline-flex items-center justify-between w-full gap-4 px-6 py-4 bg-black text-white text-sm font-bold uppercase tracking-[0.15em] transition-all duration-200 hover:bg-black/80 group-hover:gap-6"
            >
              <span>Register</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
