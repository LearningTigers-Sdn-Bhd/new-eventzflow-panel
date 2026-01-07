"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const smoothEase = [0.25, 0.46, 0.45, 0.94];

const contactMethods = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+60 17-726 8130",
    href: "https://wa.me/60177268130",
    description: "Chat with us directly",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@eventzflow.com",
    href: "mailto:info@eventzflow.com",
    description: "Send us a message",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+60 17-726 8130",
    href: "tel:+60177268130",
    description: "Give us a call",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Kota Kinabalu, Sabah",
    href: "https://maps.google.com/?q=Kota+Kinabalu+Sabah",
    description: "Visit our office",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "8AM - 5PM",
    href: null,
    description: "Monday to Friday",
  },
];

export default function ContactPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
        {/* Left vertical accent line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.5, ease: smoothEase }}
          className="absolute left-6 top-0 h-[70%] w-[2px] origin-top bg-white md:left-12 lg:left-16"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: smoothEase }}
          className="text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
            Get In Touch
          </p>
          <h1 className="font-black text-6xl uppercase tracking-tighter text-white md:text-7xl lg:text-8xl">
            Contact
          </h1>
        </motion.div>
      </section>

      {/* Contact Methods Section */}
      <section className="bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="mb-16 max-w-2xl"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-black" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
                Reach Out
              </p>
            </div>
            <h2 className="mb-6 font-black text-4xl uppercase tracking-tighter text-black md:text-5xl">
              Let's talk about your event
            </h2>
            <p className="text-base leading-relaxed text-black/60 md:text-lg">
              Whether you're planning your first event or managing hundreds,
              we'd love to hear from you. No pressure, no sales pitch — just
              real conversation.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              const isBlackCard = index % 2 === 0;
              const CardWrapper = method.href ? motion.a : motion.div;
              const linkProps = method.href
                ? {
                    href: method.href,
                    target: method.href.startsWith("http")
                      ? "_blank"
                      : undefined,
                    rel: method.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined,
                  }
                : {};
              return (
                <CardWrapper
                  key={method.label}
                  {...linkProps}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: smoothEase,
                  }}
                  whileHover={{ y: -8 }}
                  className={`group flex min-h-[240px] flex-col justify-between border p-8 transition-all duration-300 hover:shadow-2xl ${
                    isBlackCard
                      ? "border-white/20 bg-black hover:border-white"
                      : "border-black/20 bg-white hover:border-black"
                  }`}
                >
                  <div>
                    <div
                      className={`mb-6 flex h-12 w-12 items-center justify-center border ${
                        isBlackCard
                          ? "border-white/30 text-white"
                          : "border-black/30 text-black"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <p
                      className={`text-xs font-bold uppercase tracking-[0.2em] ${
                        isBlackCard ? "text-white/40" : "text-black/40"
                      }`}
                    >
                      {method.label}
                    </p>
                    <p
                      className={`mt-2 text-sm ${
                        isBlackCard ? "text-white/60" : "text-black/60"
                      }`}
                    >
                      {method.description}
                    </p>
                  </div>
                  <p
                    className={`font-bold text-lg ${
                      isBlackCard ? "text-white" : "text-black"
                    }`}
                  >
                    {method.value}
                  </p>
                </CardWrapper>
              );
            })}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: smoothEase }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-black/50 md:gap-8"
          >
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
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-black px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="h-[2px] w-10 bg-white" />
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-white">
                Find Us
              </p>
            </div>
            <h2 className="font-black text-3xl uppercase tracking-tighter text-white md:text-4xl">
              Our Location
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-xl">
              Lot 9, 1st Floor, Blok B, Damai Plaza Phase 4, Jalan Pokok Kayu
              Manis 2, 88200 Kota Kinabalu, Sabah (Above Aroma Italy Restaurant)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
            className="relative aspect-[4/3] w-full overflow-hidden border border-white/20 md:aspect-[21/9] md:min-h-[500px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.2301173092237!2d116.08780927599177!3d5.963007229420742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x323b69190b59313b%3A0x3af9da7fef01d207!2sAroma%20Italy%20%40Kimbins!5e0!3m2!1sen!2smy!4v1767763606188!5m2!1sen!2smy"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="EventzFlow Office Location"
              className="absolute inset-0"
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
