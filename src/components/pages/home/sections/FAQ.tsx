"use client";

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

const FAQ: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the WhatsApp Automation handle ticket sales automatically?",
      answer: "Our AI-powered WhatsApp Automation engages customers in natural conversations, processes payments instantly, generates QR codes, and delivers tickets automatically - all without human intervention. It operates 24/7 in multiple languages with a 94% conversion rate."
    },
    {
      question: "How quickly can I set up and launch my ticketing platform?",
      answer: "You can launch your complete event management platform in under 5 minutes! One-click deployment with instant WhatsApp integration, configure multiple events and pricing tiers, and start selling tickets immediately. No technical knowledge required."
    },
    {
      question: "What's included in the tiered pricing plans?",
      answer: "Each plan includes a minimum number of tickets with additional tickets available at set rates. All plans include WhatsApp integration, QR code generation, instant delivery, and real-time analytics. The Paid Events plan includes automation flow setup for up to 3 pricing tiers."
    },
    {
      question: "How does the QR code generation and validation work?",
      answer: "QR codes are generated automatically within 0.3 seconds after payment confirmation and delivered instantly via WhatsApp. At events, staff can scan codes for instant validation with 100% accuracy, even offline. Real-time check-in tracking keeps you informed."
    },
    {
      question: "What integrations and API access do I get?",
      answer: "Full REST API access for custom integrations, webhook automation for real-time sync, and no-code connections with Zapier, Make, WooCommerce, and 50+ platforms. Connect your existing business tools seamlessly."
    },
    {
      question: "Can the platform handle large-scale events?",
      answer: "Absolutely! Our enterprise-grade infrastructure can handle events of any size. The platform includes dedicated databases for large events, multi-point access control, team management tools, and advanced analytics dashboards."
    },
    {
      question: "What customer support and communication features are included?",
      answer: "24/7 automated WhatsApp customer support handles inquiries, refunds, and support tickets. The system includes multi-language support, automated reminders, event updates, and broadcast messaging to keep attendees engaged."
    },
    {
      question: "What security and compliance measures are in place?",
      answer: "Military-grade end-to-end encryption, GDPR/SOC2/ISO compliance, role-based access control with multi-factor authentication, and enterprise security protocols. Your data and customer payments are fully protected with 99.8% uptime."
    }
  ];

  return (
    <section id="question-answers" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.15 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xl mb-3 sm:mb-4 lg:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">FAQ</span>
          </motion.div>

          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4 lg:px-0 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.25, delay: 0.03 }}
          >
            Got Questions?
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              We Have Answers
            </span>
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-4 lg:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Everything you need to know about 
            <span className="text-primary font-semibold"> WhatsApp ticketing and automated event management</span>
          </motion.p>
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          className="space-y-3 sm:space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.13 }}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div
                key={index}
                className="bg-background/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary/50 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.2, delay: 0.09 + index * 0.015 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
              >
                {/* Question */}
                <motion.button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-4 py-4 sm:px-6 sm:py-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors duration-200"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-base sm:text-lg font-semibold pr-3 sm:pr-4 leading-tight">
                    {faq.question}
                  </span>
                  <motion.div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
                    }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isOpen ? "minus" : "plus"}
                        initial={{ opacity: 0, rotate: isOpen ? 90 : -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: isOpen ? -90 : 90 }}
                        transition={{ duration: 0.1 }}
                      >
                        {isOpen ? (
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                        ) : (
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.button>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        className="px-4 pb-4 sm:px-6 sm:pb-6 border-t"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.1, delay: 0.05 }}
                      >
                        <p className="text-muted-foreground leading-relaxed pt-3 sm:pt-4 text-sm sm:text-base">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.38 }}
        >
          <motion.div 
            className="bg-background/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-6 sm:p-8"
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.25, delay: 0.43 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
          >
            <motion.h3 
              className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.2, delay: 0.48 }}
            >
              Still have questions?
            </motion.h3>
            <motion.p 
              className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.2, delay: 0.5 }}
            >
              Our team is here to help you get started with WhatsApp ticket sales
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.2, delay: 0.53 }}
            >
              <Button 
                size="lg"
                className="text-sm sm:text-base"
              >
                Contact Support
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="text-sm sm:text-base"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;

