"use client";

import React from 'react';
import { Check, Zap, Crown, DollarSign, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

const PricingPlans: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const plans = [
    {
      name: "Free Event",
      icon: Zap,
      basePrice: 1000,
      currency: "RM",
      minTickets: 500,
      additionalTicketPrice: 40,
      additionalTicketUnit: 50,
      description: "Suitable for social gatherings",
      features: [
        "Up to 500 tickets included",
        "Additional 50 tickets for RM40",
        "1x WhatsApp Alert per ticket included",
        "RM0.20 per additional alert",
        "Suitable for wedding, anniversaries, social gatherings, etc"
      ],
      color: "from-slate-600 to-slate-700",
      popular: false
    },
    {
      name: "Paid Events", 
      icon: Crown,
      basePrice: 10000,
      currency: "RM",
      minTickets: 500,
      additionalTicketPrice: 40,
      additionalTicketUnit: 50,
      description: "Perfect for conferences & expos",
      features: [
        "Up to 500 tickets included",
        "Additional 50 tickets for RM40",
        "1x WhatsApp Alert per ticket included",
        "RM0.20 per additional alert",
        "Includes automation flow setup up to 3 tiers pricing",
        "Additional RM1,000 for every 2 tiers",
        "Perfect for conferences, expo, large scale meetings",
        "15% discount to Sales Chatalyst AI Automation system"
      ],
      color: `from-[${colors.primary}] to-[${colors.blue}]`,
      popular: true
    },
    {
      name: "Unique Stalls / Booths QR Add-On",
      icon: QrCode,
      basePrice: 2000,
      currency: "RM",
      minTickets: 100,
      additionalTicketPrice: 1000,
      additionalTicketUnit: 50,
      description: "QR code generation for stalls",
      features: [
        "Up to 100 stalls / booths",
        "Unique QR code generation for each stall",
        "Real-time visitor tracking and analytics",
        "Instant product information display",
        "Lead capture and management system",
        "Additional 50 stalls / booths for RM1,000"
      ],
      color: "from-purple-600 to-pink-600",
      popular: false
    }
  ];

  return (
    <section id="pricing-plans" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
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
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">Fair Pricing</span>
          </motion.div>

          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4 lg:px-0 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.25, delay: 0.03 }}
          >
            Simple, Transparent
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Event Pricing
            </span>
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-4 lg:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Pay only for what you use with our event-based pricing. 
            <span className="text-primary font-semibold"> No hidden fees, no monthly subscriptions</span> - just transparent pricing that grows with your events.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.13 }}
        >
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isPopular = plan.popular;
            const isUniqueStall = plan.name === "Unique Stalls / Booths QR Add-On";
            
            return (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0
                }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={`relative h-full bg-background/40 backdrop-blur-sm border ${
                  isPopular 
                    ? 'border-primary/40 shadow-lg shadow-primary/5 hover:border-primary hover:shadow-primary/20'
                    : isUniqueStall
                    ? 'border-purple-500/40 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20'
                    : 'border-border hover:border-primary/50 hover:shadow-lg'
                } rounded-3xl p-8 flex flex-col transition-all duration-300`}>
                  
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
                        style={{
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
                        }}
                      >
                        RECOMMENDED
                      </div>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  
                  {/* Price */}
                  <div className={`mb-8 border rounded-lg p-4 ${
                    isPopular
                      ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-ring/5'
                      : isUniqueStall
                      ? 'border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/5'
                      : 'border-border bg-muted/50'
                  }`}>
                    <div className="flex items-baseline gap-1">
                      <span className="text-muted-foreground text-3xl font-medium">{plan.currency}</span>
                      <span className="text-5xl font-bold tracking-tight">
                        {plan.basePrice.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-base font-normal">/per event</span>
                    </div>
                  </div>
                
                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <Button 
                    className={`w-full ${!isPopular && !isUniqueStall ? '' : ''}`}
                    style={
                      isPopular
                        ? { background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})` }
                        : isUniqueStall
                        ? { background: `linear-gradient(to right, #9333ea, #db2777)` }
                        : undefined
                    }
                    variant={!isPopular && !isUniqueStall ? "outline" : "default"}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;

