"use client";

import React from 'react';
import { 
  Zap, 
  MessageSquare, 
  Shield, 
  BarChart3,
  Users, 
  Clock,
  Sparkles,
  CheckCircle,
  DollarSign,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';

const BenefitsSection: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const benefits = [
    {
      icon: Zap,
      title: "Lightning-Fast Platform Setup",
      description: "Launch your complete event management platform in under 5 minutes. No technical knowledge required.",
      details: [
        "One-click platform deployment with instant WhatsApp integration",
        "Configure multiple events and pricing tiers in minutes",
        "Full ticketing system goes live immediately with automated sales"
      ],
      color: "from-yellow-500 to-orange-400",
      bgGradient: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      icon: MessageSquare,
      title: "Intelligent Customer Engagement",
      description: "Advanced WhatsApp automation with multi-language support handles global customers 24/7 with professional service.",
      details: [
        "AI-powered conversations in 7+ languages with natural interactions",
        "Instant payment processing with multiple gateway integrations",
        "Smart customer profiling with behavioral insights and preferences"
      ],
      color: "from-green-500 to-emerald-400",
      bgGradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
      borderColor: "border-green-500/20"
    },
    {
      icon: DollarSign,
      title: "Enterprise Payment Solutions",
      description: "Professional payment processing with fraud protection, multi-currency support, and comprehensive financial reporting.",
      details: [
        "Multiple payment gateways with fraud detection and prevention",
        "Multi-currency support with regional pricing optimization",
        "Advanced financial reporting with revenue analytics and forecasting"
      ],
      color: "from-blue-500 to-cyan-400",
      bgGradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: BarChart3,
      title: "Advanced Business Intelligence",
      description: "Comprehensive analytics platform with real-time insights, predictive analytics, and performance optimization tools.",
      details: [
        "Real-time dashboard with live event metrics and sales tracking",
        "Predictive analytics for attendance forecasting and revenue optimization",
        "Custom reporting with API integration and automated insights"
      ],
      color: "from-purple-500 to-violet-400",
      bgGradient: "bg-gradient-to-br from-purple-500/10 to-violet-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: Shield,
      title: "Enterprise Security & Compliance",
      description: "Military-grade security infrastructure with compliance frameworks, data protection, and access control systems.",
      details: [
        "End-to-end encryption with enterprise security protocols",
        "GDPR, SOC2, and ISO compliance with automated audit trails",
        "Role-based access control with multi-factor authentication"
      ],
      color: "from-red-500 to-pink-400",
      bgGradient: "bg-gradient-to-br from-red-500/10 to-pink-500/10",
      borderColor: "border-red-500/20"
    },
    {
      icon: Users,
      title: "Seamless Access Control & Management",
      description: "Professional entry management with QR scanning, offline capability, and comprehensive attendee tracking systems.",
      details: [
        "Multi-point access control with real-time validation and offline support",
        "Professional QR code scanning with instant verification and audit trails",
        "Advanced attendee management with check-in analytics and team coordination"
      ],
      color: "from-indigo-500 to-blue-400",
      bgGradient: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10",
      borderColor: "border-indigo-500/20"
    }
  ];

  const stats = [
    { icon: Clock, value: "24/7", label: "Platform Uptime", color: "text-yellow-400" },
    { icon: DollarSign, value: "0", label: "Setup Cost", color: "text-green-400" },
    { icon: Zap, value: "5min", label: "Platform Deployment", color: "text-blue-400" },
    { icon: Headphones, value: "100%", label: "Event Automation", color: "text-purple-400" }
  ];

  return (
    <section id="benefits-section" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 relative">
      {/* Background Effects - constrained to viewport */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-primary/15 to-ring/15 rounded-full blur-3xl opacity-60 max-w-[40vw] max-h-[40vw]"></div>
        <div className="absolute bottom-1/4 left-4 sm:left-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl opacity-50 max-w-[35vw] max-h-[35vw]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-ring/5 to-accent/5 rounded-full blur-3xl opacity-40 max-w-[30vw] max-h-[30vw]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-2 sm:px-4 sm:py-2 shadow-2xl mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">Platform Benefits</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Transform Your
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Event Business
            </span>
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Discover how our comprehensive platform revolutionizes event management, ticket sales, and customer engagement for modern event organizers
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            
            return (
              <motion.div
                key={index}
                className={`group relative bg-background/60 backdrop-blur-sm border rounded-lg sm:rounded-xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl flex flex-col h-full`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.25, delay: 0.03 * index }}
                whileHover={{ y: -5 }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${benefit.bgGradient} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${benefit.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  
                  {/* Title */}
                  <motion.h3 
                    className="text-base sm:text-lg font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.2, delay: 0.08 + index * 0.03 }}
                  >
                    {benefit.title}
                  </motion.h3>
                  
                  {/* Description */}
                  <motion.p 
                    className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.2, delay: 0.1 + index * 0.03 }}
                  >
                    {benefit.description}
                  </motion.p>
                  
                  {/* Details */}
                  <motion.div 
                    className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 flex-grow"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.2, delay: 0.13 + index * 0.03 }}
                  >
                    {benefit.details.map((detail, detailIndex) => (
                      <motion.div 
                        key={detailIndex}
                        className="flex items-start space-x-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.05 }}
                        transition={{ duration: 0.15, delay: 0.15 + index * 0.03 + detailIndex * 0.03 }}
                      >
                        <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-xs leading-relaxed">{detail}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.13 }}
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={index}
                className="bg-background/40 backdrop-blur-sm border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-background/60 transition-all duration-300"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.25, delay: 0.18 + index * 0.03 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -3,
                  transition: { duration: 0.1 }
                }}
              >
                <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} mx-auto mb-1 sm:mb-2`} />
                <motion.div 
                  className="text-lg sm:text-2xl font-bold mb-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.2, delay: 0.23 + index * 0.03 }}
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  className="text-muted-foreground font-medium text-xs leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.2, delay: 0.25 + index * 0.03 }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
