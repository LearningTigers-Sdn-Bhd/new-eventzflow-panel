"use client";

import type React from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, MessageCircle } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <motion.div 
        className="relative mx-auto flex max-w-5xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 font-semibold text-[10px] text-primary-foreground uppercase tracking-[0.2em] backdrop-blur-sm sm:px-4 sm:py-2 sm:text-xs">
          <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Let's Connect
        </span>

        <h2 className="mt-4 px-4 font-semibold text-2xl text-primary-foreground sm:mt-6 sm:text-3xl lg:text-4xl xl:text-5xl">
          Want to learn more?
        </h2>

        <p className="mt-3 max-w-3xl px-4 text-primary-foreground/90 text-sm leading-relaxed sm:mt-4 sm:text-base lg:text-lg">
          Whether you're planning your first event or managing many, we'd love to hear from you. 
          Share your challenges, ask questions, or just say hello. No pressure, no sales pitch—just real conversation.
        </p>

        <div className="mt-6 flex w-full max-w-md flex-col items-stretch gap-3 px-4 sm:mt-8 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0 lg:mt-10">
          <a 
            href="https://wa.me/60177268130"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-background px-6 font-semibold text-foreground text-sm shadow-lg transition-all duration-300 hover:bg-background/90 hover:shadow-xl active:scale-95 sm:h-12 sm:w-auto sm:min-w-[220px] sm:text-base"
          >
            <Users className="h-4 w-4 sm:h-4 sm:w-4" />
            Chat on WhatsApp
          </a>

          <a 
            href="mailto:info@saleschatalyst.com"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-primary-foreground/60 bg-transparent px-6 font-semibold text-primary-foreground text-sm transition-all duration-300 hover:border-primary-foreground hover:bg-primary-foreground/10 active:scale-95 sm:h-12 sm:w-auto sm:min-w-[220px] sm:text-base"
          >
            <Mail className="h-4 w-4 sm:h-4 sm:w-4" />
            Send us an email
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-4 text-primary-foreground/80 text-xs sm:mt-8 sm:gap-4 sm:text-sm lg:mt-10">
          <span className="whitespace-nowrap">✓ Real humans respond</span>
          <span className="hidden h-1 w-1 rounded-full bg-primary-foreground/70 sm:inline-block" />
          <span className="whitespace-nowrap">✓ No pushy sales tactics</span>
          <span className="hidden h-1 w-1 rounded-full bg-primary-foreground/70 sm:inline-block" />
          <span className="whitespace-nowrap">✓ Quick & friendly replies</span>
        </div>
      </motion.div>
    </section>
  );
};
