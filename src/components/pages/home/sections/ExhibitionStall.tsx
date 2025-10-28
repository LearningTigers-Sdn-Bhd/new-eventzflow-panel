"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Scan, 
  BarChart3, 
  Users, 
  ArrowRight,
  Database,
  Store,
  Rocket,
  Presentation
} from 'lucide-react';
import Link from 'next/link';

const ExhibitionStall: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const features = [
    {
      icon: QrCode,
      title: "Distinctive QR Code Per Booth",
      description: "Each exhibition booth receives its own unique QR code, enabling seamless visitor engagement and effortless interaction with exhibitors",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Scan,
      title: "Quick Access to Product Details",
      description: "Attendees scan booth QR codes for immediate access to comprehensive product specifications, digital brochures, and marketing content",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Intelligent Lead Collection",
      description: "Visitor contact details are seamlessly captured when scanning QR codes, allowing exhibitors to build qualified prospect lists efficiently",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Live Exhibition Insights",
      description: "Access real-time metrics including booth visits, scan activity, peak engagement periods, and detailed visitor interaction patterns",
      color: "from-orange-500 to-red-500"
    }
  ];

  const useCases = [
    {
      title: "Trade Shows & Expos",
      description: "Perfect for large-scale exhibitions where exhibitors need to capture and manage visitor leads efficiently",
      icon: Store,
      stats: "500+ Exhibitors"
    },
    {
      title: "Product Launches",
      description: "Enable brands to capture interested customer data during product demonstration events",
      icon: Rocket,
      stats: "1000+ Leads"
    },
    {
      title: "Industry Conferences",
      description: "Combine event ticketing with exhibitor stall management for seamless conference exhibitions",
      icon: Presentation,
      stats: "200+ Booths"
    }
  ];

  return (
    <section id="exhibition-stall" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 right-10 w-96 h-96 bg-gradient-to-r from-primary/15 to-ring/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-10 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
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
            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-foreground tracking-wide">Smart QR Exhibition System</span>
          </motion.div>
          
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Turn Every Exhibition Visit Into
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Qualified Leads with Smart QR
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Say goodbye to manual contact collection! Empower your booth with 
            <span style={{ color: colors.primary }} className="font-semibold"> intelligent QR technology</span> - visitors get instant access to your product catalogs and promotional content while you automatically capture every lead without lifting a finger
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                className="group bg-background/60 backdrop-blur-sm border rounded-xl p-4 sm:p-6 hover:border-primary transition-all duration-300"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ 
                  duration: 0.25, 
                  delay: 0.15 + index * 0.03,
                  type: "spring",
                  stiffness: 120
                }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  transition: { duration: 0.2 } 
                }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Use Cases */}
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
            Perfect For Every
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            > Exhibition Type</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border rounded-xl p-6 hover:border-primary transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="h-10 w-10 text-primary" />
                    <span className="text-primary font-bold text-sm">{useCase.stats}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{useCase.title}</h4>
                  <p className="text-muted-foreground text-sm">{useCase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {[
            { icon: Scan, value: "Instant", label: "Product Info Access" },
            { icon: Database, value: "Auto", label: "Lead Capture" },
            { icon: BarChart3, value: "Real-time", label: "Analytics" },
            { icon: QrCode, value: "Digital", label: "Catalogs" }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-background/40 backdrop-blur-sm border rounded-xl p-4 text-center hover:bg-background/60 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.25, delay: 0.45 + index * 0.03 }}
                whileHover={{ scale: 1.05 }}
              >
                <IconComponent className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Link href="/login">
            <motion.button 
              className="group text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 mx-auto hover:shadow-2xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.blue})`,
                boxShadow: `0 10px 40px ${colors.primary}40`
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                boxShadow: `0 20px 60px ${colors.primary}60`
              }}
              whileTap={{ scale: 0.95 }}
            >
              <QrCode className="h-6 w-6" />
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
          <p className="text-muted-foreground text-sm mt-4">
            ✓ Instant product info sharing ✓ Automatic lead capture ✓ Digital catalogs
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ExhibitionStall;
