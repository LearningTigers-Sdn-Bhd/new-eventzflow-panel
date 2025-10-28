"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, MessageCircle, Clock, QrCode, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PhoneWithDecoration from '@/components/devices/PhoneWithDecoration';
import EventPainPointScreen from '@/components/devices/screen/EventPainPointScreen';

const PainPoints: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const problems = [
    {
      title: "Manual ticket sales processes",
      description: "Time-consuming manual handling of customer inquiries and ticket sales"
    },
    {
      title: "Limited customer support hours", 
      description: "Missing sales opportunities when staff isn't available to respond"
    },
    {
      title: "Complex ticketing platforms",
      description: "Customers abandon purchases due to complicated registration processes"
    },
    {
      title: "Delayed ticket delivery",
      description: "Manual processing causes delays in ticket delivery to customers"
    }
  ];

  const solutions = [
    {
      title: "Automated WhatsApp Flow Sales",
      description: "24/7 automated ticket sales through WhatsApp without human intervention",
      icon: MessageCircle,
      demoType: "whatsapp"
    },
    {
      title: "24/7 Customer Support",
      description: "Bot handles inquiries and sales around the clock, never missing opportunities",
      icon: Clock,
      demoType: "pricing"
    },
    {
      title: "Instant QR Code Generation",
      description: "Automatic QR code generation and delivery immediately after payment",
      icon: QrCode,
      demoType: "qr-validation"
    },
    {
      title: "One-Click WhatsApp Purchasing", 
      description: "Simple conversation-based ticket buying through familiar WhatsApp Native interface",
      icon: Smartphone,
      demoType: "whatsapp-miniapp"
    }
  ];

  // Demo animations state
  const [demoStates, setDemoStates] = useState({
    whatsapp: { step: 0, isActive: false },
    pricing: { step: 0, isActive: false },
    'qr-validation': { step: 0, isActive: false },
    'whatsapp-miniapp': { step: 0, isActive: false }
  });

  // Auto-progress demo animations - always active
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    Object.keys(demoStates).forEach((demoType) => {
      const interval = setInterval(() => {
        setDemoStates(prev => {
          const maxSteps = getMaxSteps(demoType);
          const currentStep = prev[demoType as keyof typeof prev].step;
          return {
            ...prev,
            [demoType]: {
              ...prev[demoType as keyof typeof prev],
              step: currentStep >= maxSteps - 1 ? 0 : currentStep + 1,
              isActive: true // Always keep active
            }
          };
        });
      }, 2000);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, []); // Remove demoStates dependency to prevent recreation

  const getMaxSteps = (demoType: string) => {
    switch (demoType) {
      case 'whatsapp': return 4;
      case 'pricing': return 3;
      case 'qr-validation': return 4;
      case 'whatsapp-miniapp': return 4;
      default: return 3;
    }
  };

  return (
    <section id="pain-points" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-primary/5 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.15 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.25, delay: 0.03 }}
          >
            Event Management
            <br />
            <span className="bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
              Shouldn't Be This Hard
            </span>
          </motion.h2>
        </motion.div>

        {/* Problems Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          >
            <motion.h3 
            className="text-lg sm:text-xl lg:text-2xl font-bold text-destructive mb-6 sm:mb-8 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.25, delay: 0.35, type: "spring", stiffness: 200 }}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              </motion.div>
              Current Problems
            </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {problems.map((problem, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-destructive/20 border border-destructive/30 rounded-lg sm:rounded-xl"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ 
                    duration: 0.3, 
                  delay: 0.2 + index * 0.04,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                  y: -2,
                    transition: { duration: 0.1 }
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ 
                      duration: 0.2, 
                    delay: 0.23 + index * 0.04,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive mt-0.5 sm:mt-1 flex-shrink-0" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.2, delay: 0.5 + index * 0.075 }}
                  >
                    <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base leading-tight">{problem.title}</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{problem.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        {/* Solutions Section */}
          <motion.div
          className="mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          >
            <motion.h3 
            className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500 mb-6 sm:mb-8 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: 90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.25, delay: 0.35, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              </motion.div>
              Our Solutions
            </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-12 sm:mb-16">
            {solutions.map((solution, index) => {
              const IconComponent = solution.icon;
              return (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-lg sm:rounded-xl"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4 + index * 0.08,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.1 }
                  }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 45 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.45 + index * 0.08,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.2, delay: 0.5 + index * 0.075 }}
                  >
                    <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base leading-tight">{solution.title}</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{solution.description}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Demos Grid */}
          <motion.div 
            className="mt-8 sm:mt-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12 sm:gap-14 lg:gap-16">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.demoType}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <PhoneWithDecoration
                    phoneKey={`ticket-demo-${solution.demoType}`}
                    delay={index * 0.1}
                    time="9:41"
                    layout={
                      <EventPainPointScreen
                        demoType={solution.demoType}
                        step={demoStates[solution.demoType as keyof typeof demoStates].step}
                        title={solution.title}
                      />
                    }
                    floatingElements={{
                      topRight: { colors: `from-[${colors.primary}] to-[${colors.blue}]`, delay: index * 0.5 },
                      bottomLeft: { colors: `from-[${colors.blue}] to-[${colors.lightGreen}]`, delay: 1 + index * 0.5 }
                    }}
                  />

                  <motion.div 
                    className="text-center mt-3 sm:mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 leading-tight">{solution.title}</h4>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{solution.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.8, delay: 2.4 }}
        >
        </motion.div>
      </div>
    </section>
  );
};

export default PainPoints;

