"use client";

import React, { useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  TicketCheck, 
  Shield, 
  Globe, 
  CreditCard, 
  BarChart3, 
  Users, 
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Database,
  Zap,
  QrCode,
  Smartphone,
  X,
  MapPin,
  UserCheck,
  ScanLine,
  TrendingUp,
  Coins,
  Webhook,
  ChartNetwork,
  ChartSpline,
  Monitor,
  WifiOff,
  Bot,
  Cloud,
  Settings,
  FileText,
  MessageCircle,
  UserCog,
  Lock
} from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

// Custom hook for counting animation
const useCounter = (target: number, duration: number, delay: number, isInView: boolean) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isInView) return;
    
    const timer = setTimeout(() => {
      let start = 0;
      const increment = target / (duration * 60); // 60fps
      
      const animate = () => {
        start += increment;
        if (start < target) {
          setCount(start);
          requestAnimationFrame(animate);
        } else {
          setCount(target);
        }
      };
      
      animate();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [target, duration, delay, isInView]);
  
  return count;
};

// StatCard component for individual stat items
const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  duration: number;
  delay: number;
  isInView: boolean;
  index: number;
}> = ({ value, suffix, label, duration, delay, isInView, index }) => {
  const count = useCounter(value, duration / 1000, delay, isInView);
  
  const formatValue = (count: number, suffix: string) => {
    if (suffix === "%") {
      return `${count.toFixed(1)}${suffix}`;
    } else if (suffix === "K+") {
      return `${(count / 1000).toFixed(0)}${suffix}`;
    } else {
      return `${Math.floor(count)}${suffix}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.05 }}
      transition={{
        duration: 0.25,
        delay: 0.1 + index * 0.03,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
    >
      <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
        {formatValue(count, suffix)}
      </div>
      <motion.div
        className="text-sm sm:text-base text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.05 }}
        transition={{ duration: 0.2, delay: 0.25 + index * 0.03 }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

const FeatureShowcase: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.05 });
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (expandedCard !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedCard]);

  const features = [
    {
      icon: Calendar,
      title: "Comprehensive Event Solutions",
      description: "Multi-language support, event management, and advanced ticketing — all seamlessly integrated in one powerful platform for global events.",
      detailedDescription: "Our platform combines three essential event management capabilities into one unified solution. Multi-language support ensures global accessibility, comprehensive event management streamlines your workflow, and advanced ticketing provides professional-grade features for any event size.",
      highlight: "All-in-One Platform",
      color: "from-blue-500 to-indigo-600",
      size: "large"
    },
    {
      icon: Smartphone,
      title: "Smart Access & Team Control",
      description: "Advanced entry management with multiple access points, role-based team coordination, and real-time scanning validation for seamless event operations.",
      detailedDescription: "Comprehensive access control system that manages multiple entry points, coordinates team activities, and provides real-time scanning capabilities for professional event management.",
      highlight: "Access Control",
      color: "from-green-600 to-emerald-500",
      size: "large"
    },
    {
      icon: ChartSpline,
      title: "Advanced Analytics & Integration Hub",
      description: "Real-time dashboard analytics, flexible WhatsApp credit system, and seamless REST API integration for comprehensive event management.",
      detailedDescription: "Complete business intelligence platform with event-specific analytics, flexible messaging credits, and developer-friendly API integration capabilities.",
      highlight: "Analytics & API",
      color: "from-purple-500 to-blue-600",
      size: "small"
    },
    {
      icon: TicketCheck,
      title: "Flexible & Reliable Platform",
      description: "Mobile-friendly design that works offline and ready for automation — ensuring seamless event management anywhere, anytime.",
      detailedDescription: "Complete mobile-optimized platform with offline functionality, responsive design, and automated workflow capabilities for professional event management on any device.",
      highlight: "Always Ready",
      color: "from-emerald-500 to-green-600",
      size: "small"
    },
    {
      icon: BarChart3,
      title: "Seamless Control & Accessibility",
      description: "Access your dashboard anywhere, customize workflows to your needs, and manage data with powerful import/export capabilities.",
      detailedDescription: "Complete control platform with global accessibility, flexible configuration options, and comprehensive data management tools for professional event operations.",
      highlight: "Full Control",
      color: "from-orange-500 to-red-600",
      size: "small"
    },
    {
      icon: MessageSquare,
      title: "Engagement & Security",
      description: "Communicate directly with attendees, track customer interactions, and ensure secure messaging with end-to-end encryption.",
      detailedDescription: "Complete engagement platform with secure WhatsApp integration, customer management tools, and encrypted communications for professional event operations.",
      highlight: "Secure Connect",
      color: "from-cyan-500 to-blue-600",
      size: "small"
    }
  ];

  return (
    <>
      <section id="feature-showcase" ref={sectionRef} className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-primary/15 to-ring/15 rounded-full blur-3xl opacity-60 max-w-[40vw] max-h-[40vw]"></div>
          <div className="absolute bottom-1/4 left-4 sm:left-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl opacity-50 max-w-[35vw] max-h-[35vw]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-ring/5 to-accent/5 rounded-full blur-3xl opacity-40 max-w-[30vw] max-h-[30vw]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-2 sm:px-4 sm:py-2 shadow-2xl mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
              <span className="text-xs sm:text-sm font-medium tracking-wide">Powerful Features</span>
            </motion.div>
            
            <motion.h2 
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Automated Ticketing
              <br />
              <span 
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
                }}
              >
                Through WhatsApp
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Set up your WhatsApp automation in minutes and let it handle ticket sales 24/7. Customers buy tickets through chat, receive QR codes instantly, and you track everything in real-time.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              const isLarge = feature.size === 'large';
              const isExpanded = expandedCard === index;
              
              return (
                <motion.div
                  key={index}
                  className={`relative cursor-pointer ${
                    isLarge ? 'sm:col-span-2' : ''
                  }`}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.03 + index * 0.04,
                    ease: "easeOut"
                  }}
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                >
                  <motion.div
                    className="bg-background/60 backdrop-blur-sm border rounded-xl sm:rounded-2xl overflow-hidden h-full hover:border-primary transition-all duration-300"
                    whileHover={{ 
                      scale: 1.02,
                      y: -5
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* Card Content */}
                    <div className={`p-4 sm:p-6 h-full flex flex-col ${
                      isLarge 
                        ? 'min-h-[200px] sm:min-h-[240px]' 
                        : 'min-h-[220px] sm:min-h-[280px]'
                    }`}>
                      {/* Icon and Title Row */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div 
                          className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                        </div>
                        
                        <div 
                          className={`inline-flex items-center bg-gradient-to-r ${feature.color} bg-opacity-20 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium`}
                        >
                          {feature.highlight}
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 
                        className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 leading-tight"
                      >
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p 
                        className="text-muted-foreground text-sm leading-relaxed flex-grow"
                      >
                        {feature.description}
                      </p>
                      
                      {/* Click indicator */}
                      <motion.div 
                        className="flex items-center justify-center mt-3 pt-3 border-t"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: false, amount: 0.05 }}
                        transition={{ duration: 0.25, delay: 0.15 + index * 0.05 }}
                      >
                        <span className="text-xs text-muted-foreground font-medium">
                          Click for details
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground ml-1" />
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Stats */}
          <motion.div 
            ref={statsRef}
            className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatCard
              value={5000}
              suffix="K+"
              label="Event Organizers"
              duration={2000}
              delay={300}
              isInView={isStatsInView}
              index={0}
            />
            <StatCard
              value={99.9}
              suffix="%"
              label="Platform Uptime"
              duration={2500}
              delay={350}
              isInView={isStatsInView}
              index={1}
            />
            <StatCard
              value={50}
              suffix="+"
              label="Event Categories"
              duration={1500}
              delay={400}
              isInView={isStatsInView}
              index={2}
            />
            <StatCard
              value={24}
              suffix="/7"
              label="Event Support"
              duration={1000}
              delay={450}
              isInView={isStatsInView}
              index={3}
            />
          </motion.div>
        </div>
      </section>

      {/* Expanded Card Modal */}
      <AnimatePresence mode="wait">
        {expandedCard !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => setExpandedCard(null)}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl mx-2 sm:mx-4 cursor-pointer"
              onClick={() => setExpandedCard(null)}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div 
                      className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${features[expandedCard].color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
                    >
                      {React.createElement(features[expandedCard].icon, { className: "h-6 w-6 sm:h-8 sm:w-8 text-white" })}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 leading-tight">
                        {features[expandedCard].title}
                      </h3>
                      <div 
                        className={`inline-flex items-center bg-gradient-to-r ${features[expandedCard].color} bg-opacity-20 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium`}
                      >
                        {features[expandedCard].highlight}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setExpandedCard(null)}
                    className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors duration-200 flex-shrink-0 ml-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Short Description */}
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {features[expandedCard].description}
                  </p>
                  
                  {/* Comprehensive Event Solutions Features */}
                  {expandedCard === 0 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Platform Features</h4>
                      
                      {/* Advanced Ticketing */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TicketCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Professional Ticketing System</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Professional ticket generation with QR codes, bulk operations, and customizable fields
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Event Management */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Smart Event Orchestration</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Organize multiple events seamlessly with personalized settings and smart notifications
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Language Support */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Global Language Intelligence</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Global reach with 7+ languages, RTL text support, and intelligent language detection
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart Access & Team Control Features */}
                  {expandedCard === 1 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Access Control Features</h4>
                      
                      {/* Scanning Capabilities */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ScanLine className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">QR Code Validation</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Fast QR code scanning with instant validation, offline support, and comprehensive audit trails
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location Management */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Multi-Point Access Control</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Configure unlimited entry gates with custom access rules and detailed analytics
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Team Collaboration */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Role-Based Team Coordination</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Streamlined team coordination with permission levels and real-time activity monitoring
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Analytics & Integration Hub Features */}
                  {expandedCard === 2 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Analytics & Integration Features</h4>
                      
                      {/* Integration Ready */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Webhook className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Enterprise API Ecosystem</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Seamless API connectivity, webhook automation, and third-party platform compatibility
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Comprehensive Analytics */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Business Intelligence Dashboard</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Advanced reporting dashboards with live metrics, revenue insights, and performance tracking
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Credit System */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Flexible Messaging Credits</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Smart messaging credits with regional pricing optimization and usage transparency
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile-First Platform Experience Features */}
                  {expandedCard === 3 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Mobile Platform Features</h4>
                      
                      {/* Automation Ready */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Workflow Automation</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Future-proof automation framework with intelligent workflow builders and AI assistance
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Offline Capability */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Offline Capability</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Reliable offline operations with smart data caching and seamless cloud synchronization
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Optimized */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Mobile Optimization</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Native mobile experience with intuitive touch controls and optimized scanning interface
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seamless Control & Accessibility Features */}
                  {expandedCard === 4 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Control & Accessibility Features</h4>
                      
                      {/* Data Management */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Intelligent Data Operations</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Robust data handling with CSV import/export, automated backups, and secure archiving
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Flexible Configuration */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Custom Workflow Engine</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Tailored event workflows with custom fields, branding options, and personalized settings
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Global Accessibility */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Cloud className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Global Access</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Universal platform access with multi-device sync and cross-timezone support
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Engagement & Security Features */}
                  {expandedCard === 5 && (
                    <div className="grid gap-3 sm:gap-4">
                      <h4 className="text-lg sm:text-xl font-semibold mb-1">Engagement & Security Features</h4>
                      
                      {/* Customer Management */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCog className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Customer Management</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Advanced attendee profiling with interaction history, preferences, and behavioral insights
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Secure Communications */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">Secure Communications</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Enterprise-grade encryption with secure messaging protocols and privacy compliance
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Integration */}
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 border">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm sm:text-base font-semibold mb-1">WhatsApp Integration</h5>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                              Professional Business API integration with rich media support and automated responses
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Detailed Description for other cards */}
                  {expandedCard !== 0 && expandedCard !== 1 && expandedCard !== 2 && expandedCard !== 3 && expandedCard !== 4 && expandedCard !== 5 && (
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Key Benefits</h4>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {features[expandedCard].detailedDescription}
                    </p>
                  </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeatureShowcase;
