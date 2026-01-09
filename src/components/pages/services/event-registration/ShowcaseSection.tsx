"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { ChatMessage } from "@/components/devices/apps/WhatsApp";
import WhatsApp from "@/components/devices/apps/WhatsApp";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const registrationMessages: ChatMessage[] = [
  {
    type: "customer",
    text: "Hi! I want to register for SME Expo 2025",
    time: "10:30",
  },
  {
    type: "bot",
    text: "Hello There! 👋\n\nI'd be happy to help you register. May I have your full name?",
    time: "10:30",
  },
  {
    type: "customer",
    text: "John Smith",
    time: "10:31",
  },
  {
    type: "bot",
    text: "Great! And your email address?",
    time: "10:31",
  },
  {
    type: "customer",
    text: "john.smith@company.com",
    time: "10:32",
  },
  {
    type: "bot",
    text: "Perfect! What's your role?",
    time: "10:32",
  },
  {
    type: "buttons",
    buttons: [
      "🎯 Marketing",
      "💻 Developer",
      "📊 Product Manager",
      "👔 Executive",
    ],
    time: "10:32",
  },
  {
    type: "customer",
    text: "👔 Executive",
    time: "10:33",
  },
  {
    type: "bot",
    text: "Excellent! ✅\n\nYou're all set for SME Expo 2025!\n\nHere's your QR code ticket:",
    time: "10:33",
  },
  {
    type: "qrcode",
    text: "QR_CODE_PLACEHOLDER",
    time: "10:33",
  },
  {
    type: "bot",
    text: "See you at the event! 🎉",
    time: "10:34",
  },
];

const highlights = [
  { number: "01", text: "Instant automated responses" },
  { number: "02", text: "Collect any info you need" },
  { number: "03", text: "Auto QR ticket generation" },
  { number: "04", text: "Works 24/7 automatically" },
];

export default function ShowcaseSection() {
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    const totalDuration = 11 * 2000 + 2000;
    const interval = setInterval(() => {
      setChatKey((prev) => prev + 1);
    }, totalDuration);
    return () => clearInterval(interval);
  }, []);

  const renderQRCode = (message: ChatMessage, index: number) => {
    if (message.type === "qrcode") {
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            duration: 0.5,
          }}
          className="flex justify-start"
        >
          <div className="rounded-[8px] rounded-tl-[2px] bg-[#1f2c34] p-2 shadow-md">
            <div className="rounded-lg bg-white p-3">
              <svg
                width="120"
                height="120"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0h7v7H0zM8 0h1v1H8zM10 0h1v1h-1zM12 0h2v1h-2zM15 0h1v2h-1zM17 0h5v1h-1v1h-1V1h-1v1h-1V1h-1zM22 0h7v7h-7zM1 1v5h5V1zM9 1h1v1H9zM11 1h1v2h1V2h2v1h-1v1h-2v1h-1V4h1V3h-1zM16 1v1h-1v1h2V2h1v2h-2v1h1v1h-2v1h1v1h-1v1h2V8h2v1h-1v2h1v-1h2V9h-2V8h1V7h-1V6h2V5h-1V4h1V3h-2V2h1V1h-3v1h-1v1h-1zM23 1v5h5V1zM2 2v3h3V2zM18 2h1v1h-1zM23 2v3h3V2zM10 3h1v1h-1zM9 4v1H8v2h1V6h1v1h2v1h-1v1H9V8h1V7H9V6H8v1H7v1h1v1H7v2H6v-2H5v1H4v2H3v1h1v-1h2v1h1v1H6v1h2v1H7v2H6v-1H4v1H3v1h1v1H3v1h2v1H4v-1H3v-1H2v1H1v1H0v-2h1v-1h1v-2h1v1H2v1h1v-2h1v1h1v2h1v-2H5v-1h1v-2H5v-1H4v-2H3v1H2v-2H1v-1H0V8h1V7h1V6h1v1h2V6H4v1h1V6h1v1h2V6h1zM20 4h1v1h-1zM21 5v1h-2v1h2v1h-3V7h1V6h1V5zM27 5h1v1h-1zM11 6h1v1h-1zM3 7v1H2V7zM5 7h1v2H5zM26 7h2v2h-2zM14 8h1v1h-1zM6 9h1v1H6zM23 9h1v2h1v-1h1v1h-1v1h2v1h-3v-1h-1v1h-1v-1h1v-2h-1v1h-1v-1h1V9h1zM27 9v3h-1v-1h-1v-1h2zM3 10v1H2v-1zM9 10h2v1h1v-1h1v2h-1v-1h-1v1H9v1h1v-1h2v2h-2v1h3v1h-1v1h1v1h-1v2h1v-1h2v1h1v-1h1v1h1v2h-1v-1h-3v2h1v1h1v1h-1v-1h-2v1h1v1H9v1h1v1H9v1h2v-2h1v2h-1v1h2v-2h1v1h2v1h-1v1h4v-1h-1v-1h-1v-2h-1v1h-2v-2h2v-1h2v2h-1v2h2v-1h2v-1h-1v-2h-1v1h-2v-2h1v-1h-1v-2h1v1h2v-2h-1v-1h1v-1h-2v-1h-1v-1h-1v-1h1v-1h-2v1h-1v-2h2v-1h-2v1h-2v-1h1V9h-2v1h-1V9h-2v1h1v1h-2v1h1v1h1v1h-1v-1h-2v-1h1v-2h-1v1H9v1h1v-1h2v1h-2v1h-1zM4 11h1v1H4zM6 11h1v1H6zM27 12h2v1h-1v1h-1zM10 13h1v1h-1zM0 14h1v1H0zM2 14h2v1H2zM5 14h2v2H6v-1H5zM1 15h1v1H1zM4 15h1v2H4zM18 15h1v1h-1zM28 15h1v3h-1zM0 16h1v2H0zM2 16h1v1H2zM22 16h2v1h-2zM25 16h1v1h-1zM1 17h1v1H1zM21 17h1v2h-2v-1h1zM24 17h1v1h-1zM26 17h1v1h-1zM6 18v1H5v1h2v-1h1v1H7v1h2v-1h1v1H9v2h1v-1h1v-1h-1v-1h2v-1h-1v-1h-1v-1H9v1H8v-1H7v1H6zM18 18h1v1h1v-1h2v1h-1v1h-1v2h-1v-1h-2v1h1v1h-2v-1h1v-2h2v-1h-1zM3 19h1v1H3zM23 19h1v1h-1zM25 19h2v1h-2zM15 20h1v1h-1zM24 20h1v1h-1zM1 21h2v1H1zM4 21h1v1H4zM0 22h1v7H0zM7 22h1v1H7zM14 22h1v2h-1zM22 22h7v7h-7zM1 23h1v1H1zM3 23h3v1h1v1H6v2H5v-1H4v-1H3v2H2v-3h1zM15 23h1v1h-1zM23 23v5h5v-5zM7 24h1v2H7zM1 25h1v2H1zM24 24v3h3v-3zM8 26h4v1h1v-1h1v1h-5v1h5v1h-6zM2 27h3v1H2zM0 28h1v1H0zM7 28h1v1H7z"
                  fill="black"
                />
              </svg>
            </div>
            <div className="mt-1 text-[#8696a0] text-[9px]">
              <span>{message.time}</span>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

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
              Registration via WhatsApp
            </h2>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: SMOOTH_EASE }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative max-w-[280px] lg:ml-40">
              {/* Decorative elements */}
              <div className="absolute -left-32 top-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Already on
                  <br />
                  their phone
                </p>
              </div>
              <div className="absolute -left-32 bottom-1/4 hidden lg:block">
                <div className="mb-4 h-px w-20 bg-black/20" />
                <p className="text-right text-xs font-medium uppercase tracking-widest text-black/40">
                  Instant
                  <br />
                  tickets
                </p>
              </div>

              <WhatsApp
                key={chatKey}
                activeKey={chatKey}
                contactName="EventzFlow"
                contactAvatar="E"
                contactStatus="online"
                messages={registrationMessages}
                renderCustomMessage={renderQRCode}
              />
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
              Let attendees register directly through WhatsApp. Our bot handles
              the entire flow — from collecting details to issuing personalized
              QR code tickets automatically. No app downloads required.
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
                  <span className="text-base font-medium text-black">
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
