"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicRegistrationFormItem } from "@/lib/api/public-registration";

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export function RegistrationOptionCards({
  eventSlug,
  forms,
}: {
  eventSlug: string;
  forms: PublicRegistrationFormItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form, index) => (
        <motion.div
          key={form.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: SMOOTH_EASE,
          }}
        >
          <Link
            href={`/events/${encodeURIComponent(eventSlug)}/register/${encodeURIComponent(form.slug)}`}
            className="group relative flex flex-col h-full min-h-[300px] bg-white border border-slate-200 rounded-[32px] p-8 transition-all duration-300 hover:border-brand-green hover:shadow-2xl hover:shadow-brand-green/5 hover:-translate-y-1"
          >
            {/* Header: Label & Arrow */}
            <div className="flex items-start justify-between mb-8">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-colors duration-300">
                Option 0{index + 1}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all duration-300 group-hover:bg-brand-green group-hover:text-white group-hover:rotate-[-45deg]">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1">
              <h2 className="font-bold text-3xl text-slate-900 leading-tight tracking-tight mb-4">
                {form.name}
              </h2>
              
              {form.description ? (
                <p className="text-slate-600 text-sm leading-relaxed max-w-[90%]">
                  {form.description}
                </p>
              ) : (
                <p className="text-slate-600 text-sm">
                  Complete your {form.name.toLowerCase()} registration here.
                </p>
              )}
            </div>

            {/* Subtle Footer indicator */}
            <div className="mt-8 flex items-center gap-2 overflow-hidden">
              <div className="h-px w-8 bg-slate-200 group-hover:w-12 group-hover:bg-brand-green transition-all duration-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-brand-green transition-colors duration-300">
                Continue
              </span>
            </div>

            {/* Unique decorative element (bottom right) */}
            <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
              <div className="h-16 w-16 rounded-full border-4 border-brand-green" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
