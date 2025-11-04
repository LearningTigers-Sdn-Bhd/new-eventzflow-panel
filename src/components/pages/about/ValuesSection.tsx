"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Award, Shield, HandCoins } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const ValuesSection: React.FC = () => {
  const cultureTraits = [
    {
      icon: Heart,
      title: "Customer success first",
      description: "We care about your event outcomes, not just software features. Your success is how we measure our own progress."
    },
    {
      icon: Users,
      title: "Built with feedback",
      description: "We actively listen to organizers, vendors, and attendees. Every conversation helps us build something better."
    },
    {
      icon: Award,
      title: "Quality & simplicity",
      description: "Clean interfaces, reliable performance, and features that actually work. We keep things simple so you can focus on your events."
    },
    {
      icon: Shield,
      title: "Security by design",
      description: "We take data protection seriously from day one. Your attendee information is encrypted and handled with care."
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-3 lg:items-start">
          <motion.div 
            className="space-y-3 sm:space-y-4 px-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <HandCoins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Our Values</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">What we stand for</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              These aren't just words on a wall. They guide every decision we make, every feature we ship, 
              and every conversation we have with our customers.
            </p>
          </motion.div>

          <motion.div 
            className="lg:col-span-2 grid gap-4 sm:gap-6 sm:grid-cols-2"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {cultureTraits.map((trait) => {
              const Icon = trait.icon;
              return (
                <motion.div
                  key={trait.title}
                  variants={item}
                  className="h-full rounded-xl sm:rounded-2xl border border-border/50 bg-card/80 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 transition-colors duration-300 hover:bg-primary/20">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-foreground">{trait.title}</h3>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{trait.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
