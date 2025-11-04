"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Sparkles,
  CheckCircle2,
  ScrollText
} from 'lucide-react';

// Simple container animation that fades in children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const StorySection: React.FC = () => {
  const missionPillars = [
    {
      icon: Heart,
      title: "Built from experience",
      description: "We've seen the chaos of disjointed event tools, endless spreadsheets, and frustrated attendees. EventzFlow is our answer to these challenges."
    },
    {
      icon: Users,
      title: "Designed with organizers",
      description: "Every feature reflects real conversations with event teams. We're building this alongside the people who will actually use it every day."
    },
    {
      icon: Sparkles,
      title: "Technology meets hospitality",
      description: "Great events blend seamless operations with genuine human connection. Our platform handles the complexity so you can focus on creating memorable experiences."
    }
  ];

  const storyMilestones = [
    {
      year: "Phase 1",
      title: "The spark",
      description: "We saw event organizers struggling with disconnected tools, manual processes, and frustrated attendees. We knew technology could solve these problems elegantly.",
      impact: "Identified the core problems worth solving"
    },
    {
      year: "Phase 2",
      title: "Building the foundation",
      description: "We integrated our Sales Chatalyst technology for WhatsApp automation and built core features: lightning-fast check-ins, badge printing, and real-time analytics.",
      impact: "Created a unified platform from the ground up"
    },
    {
      year: "Phase 3",
      title: "Launch & learn",
      description: "EventzFlow is now live and helping organizers across Asia-Pacific. Every event teaches us something new, and we're constantly refining the experience.",
      impact: "Learning and improving with every event"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-10 lg:mb-12 space-y-3 sm:space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <ScrollText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Our Story</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground px-2">
            Why we created EventzFlow
          </h2>
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
            We built EventzFlow to solve a problem we saw happening everywhere: talented event organizers wasting hours 
            on manual tasks, juggling disconnected tools, and unable to deliver the seamless experiences they envisioned. 
            We knew there had to be a better way, so we created it.
          </p>
        </motion.div>

        {/* Mission Pillars */}
        <motion.div 
          className="grid gap-4 sm:gap-5 md:grid-cols-3 mb-8 sm:mb-10 lg:mb-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {missionPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                variants={item}
                className="rounded-xl sm:rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-2.5">
                  <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 sm:p-2.5 transition-colors duration-300 hover:bg-primary/20">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{pillar.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Journey Cards - Compact Horizontal */}
        <motion.div 
          className="rounded-2xl sm:rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background p-5 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-5 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">How we got here</h3>
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              From concept to launch, our journey in three phases
            </p>
          </div>

          <motion.div 
            className="grid gap-4 sm:gap-5 md:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {storyMilestones.map((milestone) => (
              <motion.div
                key={milestone.year}
                variants={item}
                className="rounded-xl sm:rounded-2xl border border-border/60 bg-card/80 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 mb-2 sm:mb-2.5">
                  <span className="text-xs font-semibold text-primary">{milestone.year}</span>
                </div>
                
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">{milestone.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2.5 sm:mb-3">{milestone.description}</p>
                
                <div className="flex items-start gap-2 pt-2 sm:pt-2.5 border-t border-border/50">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{milestone.impact}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
