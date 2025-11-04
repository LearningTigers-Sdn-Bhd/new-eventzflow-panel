"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Users, TrendingUp, Pickaxe } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const ApproachSection: React.FC = () => {
  const approachPrinciples = [
    {
      icon: Target,
      title: "Listen first, build second",
      description: "We actively seek feedback from event organizers to understand real pain points before writing a single line of code."
    },
    {
      icon: Zap,
      title: "Simplicity over complexity",
      description: "Events are stressful enough. We obsess over making powerful features feel effortless to use, even for first-time users."
    },
    {
      icon: Users,
      title: "Human-centered support",
      description: "Real people, real answers. Reach us via WhatsApp or email—no endless phone trees or automated responses."
    },
    {
      icon: TrendingUp,
      title: "Iterate and improve",
      description: "Every event teaches us something new. We're committed to continuous improvement based on real-world usage and feedback."
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <Pickaxe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>How We Work</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground px-2">Our approach to building great products</h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
            We believe the best solutions come from listening, iterating, and staying close to the people 
            who use what we build every day.
          </p>
        </motion.div>

        <motion.div 
          className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {approachPrinciples.map((principle) => {
            const Icon = principle.icon;
            return (
              <motion.div
                key={principle.title}
                variants={item}
                className="h-full rounded-xl sm:rounded-2xl border border-border/60 bg-card/80 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="flex items-center justify-center rounded-lg bg-primary/10 h-10 w-10 sm:h-12 sm:w-12 transition-colors duration-300 hover:bg-primary/20">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-sm sm:text-base font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
