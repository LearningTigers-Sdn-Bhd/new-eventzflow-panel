"use client";

import React from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3,
  Sparkles,
  Zap,
  Eye,
  MapPin,
  Radio,
  Cpu,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const AIFeaturesSection: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const features = [
    {
      icon: MapPin,
      title: "Visitor Booth Tracking",
      description: "Real-time booth visit tracking with heat maps and dwell time analytics",
      details: [
        "Track visitor movement across exhibition halls",
        "Identify high-traffic zones and popular booths",
        "Real-time attendance and engagement metrics",
        "Heat map visualization of visitor flow patterns"
      ],
      color: "from-blue-500 to-cyan-500",
      bgGradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: Brain,
      title: "AI Audience Profiling",
      description: "Intelligent visitor profiling with behavioral analysis and interest mapping",
      details: [
        "Automated attendee segmentation by interests",
        "Behavioral pattern recognition and analysis",
        "Engagement scoring and quality metrics",
        "Predictive audience insights for future events"
      ],
      color: "from-purple-500 to-pink-500",
      bgGradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Target,
      title: "Smart Retargeting",
      description: "AI-powered retargeting campaigns based on visitor behavior and preferences",
      details: [
        "Automated follow-up messaging sequences",
        "Personalized content recommendations",
        "Multi-channel engagement campaigns",
        "ROI tracking and campaign optimization"
      ],
      color: "from-orange-500 to-red-500",
      bgGradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10",
    },
    {
      icon: Activity,
      title: "Real-time Booth Analytics",
      description: "Live analytics dashboard with engagement metrics and visitor insights",
      details: [
        "Live booth performance monitoring",
        "Visitor engagement time tracking",
        "Comparative booth analysis",
        "Export detailed analytics reports"
      ],
      color: "from-green-500 to-emerald-500",
      bgGradient: "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
    }
  ];

  const stats = [
    { icon: Eye, value: "100%", label: "Visitor Coverage", color: "text-blue-400" },
    { icon: Cpu, value: "AI", label: "Powered Insights", color: "text-purple-400" },
    { icon: Zap, value: "Real-time", label: "Data Processing", color: "text-green-400" },
    { icon: TrendingUp, value: "3x", label: "Engagement Boost", color: "text-orange-400" }
  ];

  return (
    <section id="ai-features-section" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-4 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl opacity-60 max-w-[40vw] max-h-[40vw]"></div>
        <div className="absolute bottom-1/4 right-4 sm:right-10 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-50 max-w-[35vw] max-h-[35vw]"></div>
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
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-2 sm:px-4 sm:py-2 shadow-2xl mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">AI-Powered Intelligence</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Smart Event Intelligence
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Beyond Basic Registration
            </span>
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p 
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Leverage AI-powered booth tracking, audience profiling, and retargeting to transform visitor data into actionable insights and measurable ROI.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <motion.div
                key={index}
                className={`group relative bg-background/60 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 flex flex-col h-full`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.25, delay: 0.05 + index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 ${feature.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Details List */}
                  <div className="space-y-2 sm:space-y-3 flex-grow">
                    {feature.details.map((detail, detailIndex) => (
                      <motion.div 
                        key={detailIndex}
                        className="flex items-start space-x-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.05 }}
                        transition={{ duration: 0.2, delay: 0.1 + index * 0.08 + detailIndex * 0.05 }}
                      >
                        <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm leading-relaxed">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={index}
                className="bg-background/60 backdrop-blur-sm border rounded-xl p-4 sm:p-6 hover:bg-background/80 hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.25, delay: 0.25 + index * 0.05 }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color} mx-auto mb-2 sm:mb-3`} />
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium text-xs sm:text-sm leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;

