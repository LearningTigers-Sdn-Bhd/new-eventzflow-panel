"use client";

import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Heart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const missionPillars = [
  {
    icon: Heart,
    title: "Built from experience",
    description:
      "We've seen the chaos of disjointed event tools, endless spreadsheets, and frustrated attendees. EventzFlow is our answer to these challenges.",
  },
  {
    icon: Users,
    title: "Designed with organizers",
    description:
      "Every feature reflects real conversations with event teams. We're building this alongside the people who will actually use it every day.",
  },
  {
    icon: Sparkles,
    title: "Technology meets hospitality",
    description:
      "Great events blend seamless operations with genuine human connection. Our platform handles the complexity so you can focus on creating memorable experiences.",
  },
];

const storyMilestones = [
  {
    phase: "01",
    title: "The Spark",
    description:
      "We saw event organizers struggling with disconnected tools, manual processes, and frustrated attendees. We knew technology could solve these problems elegantly.",
    impact: "Identified the core problems worth solving",
  },
  {
    phase: "02",
    title: "Building the Foundation",
    description:
      "We integrated our Sales Chatalyst technology for WhatsApp automation and built core features: lightning-fast check-ins, badge printing, and real-time analytics.",
    impact: "Created a unified platform from the ground up",
  },
  {
    phase: "03",
    title: "Launch & Learn",
    description:
      "EventzFlow is now live and helping organizers across Asia-Pacific. Every event teaches us something new, and we're constantly refining the experience.",
    impact: "Learning and improving with every event",
  },
];

const values = [
  {
    icon: Heart,
    title: "Customer success first",
    description:
      "We care about your event outcomes, not just software features. Your success is how we measure our own progress.",
  },
  {
    icon: Users,
    title: "Built with feedback",
    description:
      "We actively listen to organizers, vendors, and attendees. Every conversation helps us build something better.",
  },
  {
    icon: Award,
    title: "Quality & simplicity",
    description:
      "Clean interfaces, reliable performance, and features that actually work. We keep things simple so you can focus on your events.",
  },
  {
    icon: Shield,
    title: "Security by design",
    description:
      "We take data protection seriously from day one. Your attendee information is encrypted and handled with care.",
  },
];

const approach = [
  {
    icon: Target,
    title: "Listen first, build second",
    description:
      "We actively seek feedback from event organizers to understand real pain points before writing a single line of code.",
  },
  {
    icon: Zap,
    title: "Simplicity over complexity",
    description:
      "Events are stressful enough. We obsess over making powerful features feel effortless to use, even for first-time users.",
  },
  {
    icon: Users,
    title: "Human-centered support",
    description:
      "Real people, real answers. Reach us via WhatsApp or email—no endless phone trees or automated responses.",
  },
  {
    icon: TrendingUp,
    title: "Iterate and improve",
    description:
      "Every event teaches us something new. We're committed to continuous improvement based on real-world usage and feedback.",
  },
];

export default function AboutPageClient() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-32">
        {/* Left vertical accent line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: SMOOTH_EASE }}
          className="absolute left-6 top-0 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: SMOOTH_EASE }}
          className="text-center max-w-4xl"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
            About Us
          </p>
          <h1 className="font-black text-3xl uppercase tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            The Future of Event Management
          </h1>
          <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            At EventzFlow, we're building the next generation of event
            technology. Our mission is to empower organizers with tools that are
            not only powerful but also a joy to use.
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="mb-16 max-w-3xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                Our Story
              </p>
            </div>
            <h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl">
              Why we created EventzFlow
            </h2>
            <p className="text-base leading-relaxed text-black/60 md:text-lg">
              We built EventzFlow to solve a problem we saw happening
              everywhere: talented event organizers wasting hours on manual
              tasks, juggling disconnected tools, and unable to deliver the
              seamless experiences they envisioned.
            </p>
          </motion.div>

          {/* Mission Pillars */}
          <div className="grid md:grid-cols-3 mb-16">
            {missionPillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: SMOOTH_EASE,
                  }}
                  className="group border border-white/20 bg-black p-8 transition-all duration-300 hover:bg-black/90"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center border border-white/30 text-white">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 font-bold text-lg text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-white/60">{pillar.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="bg-black p-8 md:p-12"
          >
            <h3 className="mb-8 font-bold text-2xl text-white uppercase tracking-tight">
              How We Got Here
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {storyMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: SMOOTH_EASE,
                  }}
                  className="border border-black/10 bg-white p-6"
                >
                  <span className="text-xs font-bold text-black/30">
                    Phase {milestone.phase}
                  </span>
                  <h4 className="mt-2 mb-3 font-bold text-lg text-black">
                    {milestone.title}
                  </h4>
                  <p className="mb-4 text-sm text-black/50 leading-relaxed">
                    {milestone.description}
                  </p>
                  <div className="flex items-start gap-2 border-t border-black/10 pt-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-black/40" />
                    <span className="text-xs text-black/40">
                      {milestone.impact}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-black px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {/* Left - Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="h-[2px] w-10 bg-white" />
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-white">
                  Our Values
                </p>
              </div>
              <h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-white sm:text-4xl md:text-5xl">
                What we stand for
              </h2>
              <p className="text-base leading-relaxed text-white/50">
                These aren't just words on a wall. They guide every decision we
                make, every feature we ship, and every conversation we have with
                our customers.
              </p>
            </motion.div>

            {/* Right - Values Grid */}
            <div className="lg:col-span-2 grid sm:grid-cols-2">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: SMOOTH_EASE,
                    }}
                    className="p-8 border border-black/20 bg-white transition-all duration-300 hover:bg-white/90"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/30 text-black">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="mb-3 font-bold text-lg text-black">
                      {value.title}
                    </h3>
                    <p className="text-sm text-black/60">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                How We Work
              </p>
              <div className="h-[2px] w-10 bg-black" />
            </div>
            <h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl">
              Our approach to building great products
            </h2>
            <p className="text-base leading-relaxed text-black/60 md:text-lg">
              We believe the best solutions come from listening, iterating, and
              staying close to the people who use what we build every day.
            </p>
          </motion.div>

          {/* Approach Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {approach.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: SMOOTH_EASE,
                  }}
                  whileHover={{ y: -8 }}
                  className="group border border-black/10 p-8 transition-all duration-300 hover:border-black hover:shadow-2xl"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/30 text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 font-bold text-lg text-black">
                    {item.title}
                  </h3>
                  <p className="text-sm text-black/60">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-black px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="font-black text-3xl italic uppercase tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            "Technology is best when it brings people together."
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-black/40">
              Let's Connect
            </p>
            <h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl lg:text-6xl">
              Want to learn more?
            </h2>
            <p className="mb-10 text-lg text-black/50 max-w-2xl mx-auto leading-relaxed">
              Whether you're planning your first event or managing many, we'd
              love to hear from you. No pressure, no sales pitch—just real
              conversation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/60177268130"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-black bg-white px-8 py-4 text-center text-xs font-bold tracking-widest text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                CHAT ON WHATSAPP
              </a>
              <Link
                href="/contact"
                className="w-full sm:w-auto border border-black bg-black px-8 py-4 text-center text-xs font-bold tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black"
              >
                CONTACT US
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-black/40 md:gap-8">
              <span className="flex items-center gap-2">
                <span className="text-black">✓</span> Real humans respond
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
              <span className="flex items-center gap-2">
                <span className="text-black">✓</span> No pushy sales tactics
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-black/30 md:block" />
              <span className="flex items-center gap-2">
                <span className="text-black">✓</span> Quick & friendly replies
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

