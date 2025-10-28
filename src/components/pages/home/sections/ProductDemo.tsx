"use client";

import React, { useState, useEffect } from 'react';
import { Play, Calendar, Users, MessageSquare, BarChart3, ShoppingCart, QrCode, Bot, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhatsAppSalesDemo from '@/components/devices/screen/WhatsAppSalesDemo';
import QRCodeDemo from '@/components/devices/screen/QRCodeDemo';
import CheckInDemo from '@/components/devices/screen/CheckInDemo';
import SupportDemo from '@/components/devices/screen/SupportDemo';

// Define demos outside component to prevent re-creation on every render
const demos = [
  {
    title: "WhatsApp Ticket Sales",
    description: "Customer browses available tickets and completes purchase entirely through WhatsApp chat",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-500",
    component: WhatsAppSalesDemo
  },
  {
    title: "Instant QR Code Generation",
    description: "QR code ticket automatically generated and sent via WhatsApp seconds after successful payment",
    icon: QrCode,
    color: "from-purple-500 to-pink-500",
    component: QRCodeDemo
  },
  {
    title: "QR Code Check-in Validation", 
    description: "Gate staff scans QR codes on attendee phones - instant validation shows green checkmark or red alert",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    component: CheckInDemo
  },
  {
    title: "24/7 Customer Support",
    description: "AI handles common questions about event details, ticket transfers, refund requests automatically",
    icon: Bot,
    color: "from-orange-500 to-red-500",
    component: SupportDemo
  }
];

const ProductDemo: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const [activeDemo, setActiveDemo] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Memoize the active demo component to prevent re-creation
  const ActiveDemoComponent = React.useMemo(() => {
    return React.createElement(demos[activeDemo].component);
  }, [activeDemo]);

  // Auto-cycle through demos
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setActiveDemo((prev) => (prev + 1) % demos.length);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isTransitioning]);

  // Handle manual selection
  const handleDemoSelect = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveDemo(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsTransitioning(false), 300);
    
    // Clear any existing auto-play resume timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    // Resume auto-play after 8 seconds of inactivity
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 8000);
  };

  return (
    <section id="product-demo" className="py-8 sm:py-12 lg:py-16 xl:py-24 px-4 sm:px-6 lg:px-8 bg-background/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-8 sm:mb-12 lg:mb-16"
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
            <Play className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-foreground tracking-wide">Interactive Demo</span>
          </motion.div>

          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4 lg:px-0 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.03 }}
          >
            Watch It Work
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              In Real-Time
            </span>
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-4 lg:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.05 }}
          >
            See exactly how our platform handles everything automatically - from 
            <span style={{ color: colors.primary }} className="font-semibold"> WhatsApp conversations to instant ticket delivery</span>
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start lg:items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.2, delay: 0.04 }}
        >
          {/* Demo Selector */}
          <motion.div
            className="order-first lg:order-first px-2 sm:px-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.06 }}
          >
            {/* Auto-play indicator */}
            {isAutoPlaying && (
              <motion.div 
                className="mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex space-x-1">
                  {demos.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-0.5 sm:h-1 rounded-full ${
                        index === activeDemo ? 'bg-primary' : 'bg-muted'
                      }`}
                      animate={{ 
                        width: index === activeDemo ? 20 : 6 
                      }}
                      transition={{ duration: 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">Auto</span>
              </motion.div>
            )}

            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {demos.map((demo, index) => {
                const IconComponent = demo.icon;
                const isActive = activeDemo === index;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleDemoSelect(index)}
                    className={`w-full text-left p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                      isActive 
                        ? 'border-primary bg-primary/10' 
                        : 'border bg-background/50 hover:border-primary'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.15, delay: 0.08 + index * 0.015 }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                      <motion.div 
                        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${demo.color} rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center relative`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.1 }}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        {isActive && isAutoPlaying && (
                          <motion.div
                            className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 text-xs sm:text-sm lg:text-base leading-tight">{demo.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">{demo.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Interactive Demo Display */}
          <motion.div 
            className="relative order-last lg:order-last w-full flex items-center justify-center"
            style={{ 
              paddingTop: '2rem', 
              paddingBottom: '2rem', 
              paddingLeft: '1rem', 
              paddingRight: '1rem',
              minHeight: '500px'
            }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.09 }}
          >
            {/* Gradient glow background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className={`w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-r ${demos[activeDemo].color} opacity-20 blur-3xl rounded-full`}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeDemo}
                className="relative w-full max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Phone shadow and container */}
                <div className="relative">
                  {/* Bottom shadow */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/40 blur-2xl rounded-full" />
                  
                  {/* Main shadow */}
                  <div className="drop-shadow-2xl">
                    {ActiveDemoComponent}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDemo;

