"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Code, Zap, Grid3X3, ArrowUpRight, Sparkles, Link, Webhook, Settings, CheckCircle, Star } from 'lucide-react';

const IntegrationsSection: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.05 });

  const integrationMethods = [
    {
      icon: Code,
      title: "REST API Integration",
      description: "Complete REST API access for custom integrations, event management, and real-time data synchronization with your existing systems.",
      color: "from-blue-500 to-cyan-500",
      highlight: "Developer Ready"
    },
    {
      icon: Webhook,
      title: "Webhook Automation",
      description: "Real-time webhook notifications for ticket sales, event updates, and customer actions. Keep all systems perfectly synchronized.",
      color: "from-green-500 to-emerald-500",
      highlight: "Real-time Sync"
    },
    {
      icon: Settings,
      title: "No-Code Connections",
      description: "Connect with leading automation platforms like Zapier, Make, and Pabbly Connect without any coding knowledge required.",
      color: "from-purple-500 to-pink-500",
      highlight: "No-Code Ready"
    }
  ];

  const integratedPlatforms = [
    {
      name: "WooCommerce",
      description: "Connect your online store with ticket sales functionality. Generate and deliver tickets automatically when customers complete purchases."
    },
    {
      name: "Zapier",
      description: "Link multiple applications and automate your event workflows. Build connections between different tools without technical expertise."
    },
    {
      name: "Make",
      description: "Design custom automation workflows with visual interface. Execute complex processes and data synchronization in real-time."
    },
    {
      name: "Pabbly Connect",
      description: "Create multi-step automations connecting various business applications. Cost-effective workflow automation for growing businesses."
    },
    {
      name: "Gravity Forms",
      description: "Build custom event registration forms with automatic ticket generation. Streamline attendee data collection and ticket distribution."
    },
    {
      name: "GoHighLevel",
      description: "Connect event ticketing with your marketing campaigns and customer management system for better lead tracking."
    },
    {
      name: "WhatsApp",
      description: "Send tickets and event updates directly through WhatsApp messaging. Provide customer support and notifications via chat."
    },
    {
      name: "Facebook",
      description: "Enable ticket sales through your Facebook business page. Manage event promotion and attendee registration from social media."
    },
    {
      name: "Instagram",
      description: "Sell event tickets through Instagram shopping features. Handle ticket distribution and customer engagement on the platform."
    }
  ];

  return (
    <section id="integrations-section" ref={sectionRef} className="py-12 sm:py-16 lg:py-20 xl:py-32 px-4 sm:px-6 lg:px-8 bg-muted/40 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>
        
        {/* Dynamic Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 right-4 sm:right-10 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full blur-3xl opacity-70"
          style={{
            background: `radial-gradient(circle, ${colors.primary}33 0%, ${colors.blue}33 100%)`
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 left-4 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl opacity-60"
          style={{
            background: `radial-gradient(circle, ${colors.lightGreen}26 0%, ${colors.primary}26 100%)`
          }}
          animate={{ 
            scale: [1, 0.8, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${colors.blue}1A 0%, ${colors.primary}1A 100%)`
          }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -180, -360],
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const leftPos = ((i * 37) % 100); // Pseudo-random but deterministic
          const topPos = ((i * 53 + 17) % 100); // Pseudo-random but deterministic
          const duration = 3 + ((i * 23) % 20) / 10; // Deterministic duration variation
          const delay = ((i * 41) % 20) / 10; // Deterministic delay variation
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xl mb-3 sm:mb-4 lg:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-foreground tracking-wide">Seamless Integrations</span>
          </motion.div>
          
          {/* Enhanced Main Title */}
          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight px-2 sm:px-4 lg:px-0 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <span className="relative">
              Connect & Integrate
              {/* Text glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent blur-sm opacity-50"></div>
            </span>
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Your Existing Tools
            </span>
          </motion.h2>
          
          {/* Enhanced Subtitle */}
          <motion.p 
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl lg:max-w-4xl mx-auto mb-10 sm:mb-12 lg:mb-16 xl:mb-20 leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Seamlessly connect our platform with your favorite tools and automate your event management workflow with
            <span className="text-primary font-semibold"> powerful integrations</span>
          </motion.p>

          {/* Enhanced Integration Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-24">
            {integrationMethods.map((method, index) => {
              const IconComponent = method.icon;
              
              return (
                <motion.div
                  key={index}
                  className="group relative bg-background/60 backdrop-blur-sm border rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: 0.03 * index
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Centered Icon */}
                    <div className="flex justify-center mb-4 sm:mb-5 lg:mb-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${method.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {method.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Supported Platforms Section */}
        <motion.div 
          className="text-center mb-6 sm:mb-8 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {/* Section Divider */}
          <motion.div 
            className="flex items-center justify-center mb-8 sm:mb-12 lg:mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-16 sm:w-24 lg:w-32"></div>
            <div className="mx-3 sm:mx-4 lg:mx-6 p-2 sm:p-3 bg-gradient-to-r from-background to-background/80 rounded-full border">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-16 sm:w-24 lg:w-32"></div>
          </motion.div>

          <motion.h3 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 leading-tight relative px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <span 
              className="bg-clip-text text-transparent relative"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Popular Integrations
              {/* Sparkle effects */}
              <motion.div
                className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
              <motion.div
                className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-ring rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </span>
          </motion.h3>
          
          <motion.p 
            className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 leading-relaxed px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Connect with your favorite business tools and marketing platforms to create a
            <span className="text-primary font-semibold"> unified ecosystem</span>
          </motion.p>

          {/* Integrated Platforms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {integratedPlatforms.map((platform, index) => (
              <motion.div
                key={index}
                className="group bg-background/40 backdrop-blur-sm border rounded-lg p-3 sm:p-4 hover:bg-background/60 hover:border-primary/50 transition-all duration-300 text-left"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{
                  duration: 0.25,
                  delay: 0.05 + index * 0.03,
                  type: "spring",
                  stiffness: 120
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  transition: { duration: 0.2 } 
                }}
              >
                {/* Platform Name with Icon */}
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
                    }}
                  >
                    <Link className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                    {platform.name}
                  </h4>
                </div>
                
                {/* Description */}
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {platform.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsSection;

