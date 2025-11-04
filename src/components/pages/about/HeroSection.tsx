"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-muted pt-24 pb-12 lg:min-h-screen lg:flex lg:items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(var(--primary-rgb),0.05)_0%,_transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <motion.div 
            className="inline-flex items-center gap-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/40 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>About Us</span>
          </motion.div>

          <motion.h1 
            className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            The Future of Event Management
            <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-primary to-green-400 text-transparent bg-clip-text">
              Simple, Powerful, and Intuitive
            </span>
          </motion.h1>

          <motion.p 
            className="max-w-3xl mx-auto mt-3 sm:mt-5 lg:mt-6 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            At EventzFlow, we're building the next generation of event technology. Our mission is to empower organizers with tools that are not only powerful but also a joy to use.
          </motion.p>
        </div>

        <motion.div 
          className="mt-6 sm:mt-10 lg:mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-card shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <Image
              src="/images/about/hero-team.png"
              alt="EventzFlow team in a planning session"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1000px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
