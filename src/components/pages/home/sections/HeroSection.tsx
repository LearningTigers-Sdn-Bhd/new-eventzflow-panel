"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, Zap, Users, Star, TrendingUp, Ticket } from 'lucide-react';
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {

  // Floating particles component with consistent SSR/client rendering
  const FloatingParticles = () => {
    const [isClient, setIsClient] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
    
    useEffect(() => {
      setIsClient(true);
      // Set actual viewport dimensions after hydration
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });

        const handleResize = () => {
          setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
          });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }, []);
    
    // Generate consistent seed-based positions to avoid hydration mismatch
    const generateSeededPosition = (seed: number, max: number) => {
      // Simple seeded random function
      const x = Math.sin(seed) * 10000;
      return Math.abs(x - Math.floor(x)) * max;
    };

    // Only render particles after client-side hydration to avoid mismatch
    if (!isClient) {
      return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
    }

    // Increase particle count for wider screens
    const particleCount = Math.min(80, Math.max(50, Math.floor(dimensions.width / 25)));

    const particles = Array.from({ length: particleCount }, (_, i) => {
      const initialX = generateSeededPosition(i * 2, dimensions.width);
      const initialY = generateSeededPosition(i * 2 + 1, dimensions.height);
      const targetX = generateSeededPosition(i * 3, dimensions.width);
      const targetY = generateSeededPosition(i * 3 + 1, dimensions.height);
      const duration = 15 + (i % 10); // Consistent duration based on index
      
      // Alternate between green and blue particles (EventzFlow brand colors)
      const particleColor = i % 2 === 0 
        ? "rgba(34, 197, 94, 0.4)"   // EventzFlow Green
        : "rgba(59, 130, 246, 0.3)";  // EventzFlow Blue
      
      return (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: particleColor }}
          initial={{
            x: initialX,
            y: initialY,
          }}
          animate={{
            x: targetX,
            y: targetY,
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      );
    });
    
    return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>;
  };

  // Enhanced animation variants with modern easing and effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9,
      filter: "blur(4px)"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        filter: { duration: 0.3 }
      }
    }
  };

  const buttonVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 0.85
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: 0.05
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      y: 0
    }
  };

  // Color scheme - EventzFlow Brand Colors (works in both light and dark mode)
  const colors = {
    primary: '#22C55E', // EventzFlow Green (matching logo)
    blue: '#3B82F6',    // EventzFlow Blue (matching Z in logo)
    lightGreen: '#4ADE80', // Light Green accent
  };

  return (
    <motion.section 
      id="hero-section"
      className="relative min-h-screen pb-16 sm:pb-20 flex items-center justify-center overflow-x-hidden"
      style={{
        background: "linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted)), hsl(var(--background)))"
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static gradient background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              ${colors.primary}26 0%, 
              ${colors.blue}1A 25%, 
              ${colors.lightGreen}0D 50%, 
              transparent 70%)`,
          }}
        />
        
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(${colors.primary}1A 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary}1A 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
            animate={{
              backgroundPosition: ['0px 0px', '60px 60px'],
            }}
            transition={{
              duration: 10,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        </div>

        {/* Glowing orbs - constrained to viewport */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 rounded-full blur-3xl max-w-[25vw] max-h-[25vw]"
          style={{
            backgroundColor: `${colors.primary}1A`
          }}
          animate={{
            scale: [1, 1.2, 1],
            backgroundColor: [
              `${colors.primary}1A`,
              `${colors.primary}26`, 
              `${colors.primary}1A`
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-3xl max-w-[30vw] max-h-[30vw]"
          style={{
            backgroundColor: `${colors.blue}1A`
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            backgroundColor: [
              `${colors.blue}1A`,
              `${colors.blue}2E`, 
              `${colors.blue}1A`
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Badge with rating */}
          <motion.div 
            className="flex justify-center mb-6 sm:mb-8"
            variants={itemVariants}
          >
            <div 
              className="inline-flex items-center space-x-2 sm:space-x-3 backdrop-blur-xl rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-2xl relative overflow-hidden border"
              style={{
                backgroundColor: "hsl(var(--muted) / 0.7)",
                borderColor: "hsl(var(--border))"
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, transparent, hsl(var(--foreground) / 0.1), transparent)"
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: colors.lightGreen }} />
              </motion.div>
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">
                #1 WhatsApp Event Ticketing Platform
              </span>
              <motion.div 
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Enhanced Main Title */}
          <motion.div 
            className="text-center mb-6 sm:mb-8 px-4 sm:px-0 relative"
            variants={itemVariants}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight relative">
              {/* Text glow effect */}
              <div 
                className="absolute inset-0 blur-3xl"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}33, ${colors.blue}33, ${colors.lightGreen}33)`
                }}
              />
              
              <motion.span 
                className="block text-foreground mb-1 sm:mb-2 relative z-10 drop-shadow-2xl"
                initial={{ 
                  opacity: 0, 
                  y: 60, 
                  scale: 0.8,
                  rotateX: 20,
                  filter: "blur(8px)"
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateX: 0,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  delay: 0.15, 
                  duration: 0.6, 
                  type: "spring",
                  stiffness: 100,
                  filter: { duration: 0.4 }
                }}
              >
                Manage Events and Sell Tickets
              </motion.span>
              <motion.span 
                className="block relative z-10"
                style={{
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.blue}, ${colors.lightGreen})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                initial={{ 
                  opacity: 0, 
                  y: 60, 
                  scale: 0.8,
                  rotateX: -20,
                  filter: "blur(8px)"
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  rotateX: 0,
                  filter: "blur(0px)"
                }}
                transition={{ 
                  delay: 0.25, 
                  duration: 0.6, 
                  type: "spring",
                  stiffness: 100,
                  filter: { duration: 0.4 }
                }}
              >
                Through WhatsApp Automation
              </motion.span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div 
            className="text-center mb-8 sm:mb-12 px-4 sm:px-0"
            variants={itemVariants}
          >
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto text-muted-foreground">
              Automated WhatsApp flow that handles <span style={{ color: colors.primary }} className="font-semibold">event ticket sales 24/7</span> with 
              <span style={{ color: colors.blue }} className="font-semibold"> QR code generation</span> and instant ticket delivery to attendees.
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 sm:px-0"
            variants={itemVariants}
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                size="lg"
                className="group relative overflow-hidden w-full sm:w-auto shadow-2xl text-sm sm:text-base md:text-lg text-white"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.blue})`,
                  border: 'none',
                }}
              >
                {/* Enhanced button effects */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}33, ${colors.blue}33)`
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.15 }}
                />
                
                <span className="relative z-10 flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span>Get Started Now</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
            
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button 
                variant="outline"
                size="lg"
                className="group relative overflow-hidden w-full sm:w-auto backdrop-blur-xl text-sm sm:text-base md:text-lg"
                style={{
                  borderColor: colors.primary,
                  borderWidth: '2px',
                }}
              >
                {/* Glass morphism effect */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}1A, ${colors.blue}1A)`
                  }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                
                <span className="relative z-10 flex items-center gap-2">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  <span>Watch Demo</span>
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators with integrated satisfaction stat */}
          <motion.div 
            className="mb-12 sm:mb-20 px-4 sm:px-0"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              {/* Main badges row */}
              <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 lg:gap-6">
                <motion.div 
                  className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg backdrop-blur-xl relative overflow-hidden border"
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" style={{ color: colors.primary }} />
                  <span className="text-xs sm:text-sm font-medium">Real-time Analytics</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg backdrop-blur-xl relative overflow-hidden border"
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <Ticket className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" style={{ color: colors.blue }} />
                  <span className="text-xs sm:text-sm font-medium">WhatsApp Flow</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg backdrop-blur-xl relative overflow-hidden border"
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" style={{ color: colors.lightGreen }} />
                  <span className="text-xs sm:text-sm font-medium">Growth Insights</span>
                </motion.div>
              </div>

              {/* Satisfaction stat integrated as a prominent badge */}
              <motion.div
                className="relative group"
                initial={{ 
                  scale: 0, 
                  opacity: 0
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1
                }}
                transition={{ 
                  delay: 0.4, 
                  duration: 0.5,
                  type: "spring", 
                  stiffness: 200,
                  damping: 15
                }}
              >
                {/* Glow background */}
                <motion.div 
                  className="absolute -inset-2 rounded-full blur-xl opacity-50"
                  style={{
                    background: `linear-gradient(to right, ${colors.primary}4D, ${colors.blue}4D)`
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <motion.div 
                  className="relative flex items-center space-x-2 sm:space-x-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full backdrop-blur-xl border bg-background/60"
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Star ratings */}
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.5 + i * 0.05,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 300
                        }}
                      >
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-4 sm:h-6 bg-gradient-to-b from-transparent via-border to-transparent" />
                  
                  {/* Stat */}
                  <motion.span 
                    className="text-xl sm:text-2xl lg:text-3xl font-black"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    99.8%
                  </motion.span>
                  
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Satisfaction
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ 
          opacity: 0, 
          y: 30,
          scale: 0.8
        }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: 1
        }}
        transition={{ 
          delay: 0.75, 
          duration: 0.5,
          type: "spring",
          stiffness: 120
        }}
      >
        <motion.div 
          className="flex flex-col items-center space-y-2 sm:space-y-3 cursor-pointer group"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.1 }}
        >
          <motion.span 
            className="text-xs font-medium tracking-wider hidden sm:block text-muted-foreground"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            SCROLL DOWN
          </motion.span>
          
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div 
              className="absolute inset-0 w-7 h-12 sm:w-8 sm:h-14 rounded-full blur-sm border"
              style={{ borderColor: `${colors.primary}4D` }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Main scroll indicator */}
            <motion.div 
              className="w-5 h-8 sm:w-6 sm:h-10 border-2 rounded-full flex justify-center backdrop-blur-xl bg-background/40"
              style={{ borderColor: colors.primary }}
              whileHover={{
                borderColor: colors.blue
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="w-0.5 h-2 sm:w-1 sm:h-3 rounded-full mt-1.5 sm:mt-2"
                style={{
                  background: `linear-gradient(to bottom, ${colors.blue}, ${colors.primary})`
                }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
