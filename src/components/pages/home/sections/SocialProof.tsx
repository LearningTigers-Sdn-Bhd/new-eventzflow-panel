"use client";

import React from 'react';
import { Star, Quote, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const SocialProof: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const testimonials = [
    {
      name: "Sarah Martinez",
      role: "Conference Director",
      company: "TechSummit Global",
      content: "The platform sold 5,000 conference tickets through WhatsApp automation while I slept! The system handled customer questions, processed payments, and delivered QR codes instantly. Saved us 200+ hours of manual work.",
      rating: 5,
      avatar: "SM",
      imageUrl: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Beatrice Lim",
      role: "Professional Wedding Planner",
      company: "Wedding Organizer",
      content: "My client has about 300 guests for his wedding. It was challenging to manage the guests' RSVP and keep everyone on track before, during and after the banquet. I suggested EventzFlow and it helped tremendously especially during the check-in and engaging with them before and after the event. My client loved it.",
      rating: 5,
      avatar: "BL",
      imageUrl: "https://randomuser.me/api/portraits/women/35.jpg"
    },
    {
      name: "Priya Patel",
      role: "Festival Producer", 
      company: "Cultural Arts Festival",
      content: "The ticketing platform seamlessly handled 15,000 ticket sales across our 3-day festival through WhatsApp. Customers received instant QR codes and could ask questions anytime. Zero technical issues!",
      rating: 5,
      avatar: "PP",
      imageUrl: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "Marcus Thompson",
      role: "CEO",
      company: "Professional Workshops",
      content: "Setup took 5 minutes and our ticketing system was live! The platform handles everything - from initial inquiries to ticket delivery through WhatsApp. Our attendees love the experience. Absolutely game changing!",
      rating: 5,
      avatar: "MT",
      imageUrl: "https://randomuser.me/api/portraits/men/22.jpg"
    }
  ];

  return (
    <section id="social-proof" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-background">
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
            className="inline-flex items-center space-x-2 bg-card/60 backdrop-blur-md border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xl mb-3 sm:mb-4 lg:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-foreground tracking-wide">Customer Success</span>
          </motion.div>

          <motion.h2 
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4 lg:px-0 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.03 }}
          >
            Join 100+
            <br />
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Success Stories
            </span>
          </motion.h2>
          <motion.p 
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-4 lg:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.15, delay: 0.05 }}
          >
            Event organizers worldwide trust our WhatsApp ticketing platform to 
            <span style={{ color: colors.primary }} className="font-semibold"> automate sales and delight customers</span>
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.2, delay: 0.06 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card/50 backdrop-blur-sm border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/50 transition-colors duration-300 flex flex-col h-full"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.05 }}
              transition={{ duration: 0.25, delay: 0.09 + index * 0.03 }}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.1 } 
              }}
            >
              {/* Quote Icon */}
              <motion.div
                initial={{ opacity: 0, rotate: -10 }}
                whileInView={{ opacity: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.2, delay: 0.23 + index * 0.05 }}
              >
                <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-3 sm:mb-4" />
              </motion.div>
              
              {/* Content */}
              <motion.p 
                className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
              >
                "{testimonial.content}"
              </motion.p>
              
              {/* Rating and Author - Bottom Section */}
              <div className="mt-auto">
                {/* Rating */}
                <motion.div 
                  className="flex items-center mb-3 sm:mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.2, delay: 0.28 + index * 0.05 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false, amount: 0.05 }}
                      transition={{ 
                        duration: 0.15, 
                        delay: 0.3 + index * 0.05 + i * 0.03,
                        type: "spring",
                        stiffness: 300
                      }}
                    >
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Author */}
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.05 }}
                  transition={{ duration: 0.2, delay: 0.33 + index * 0.05 }}
                >
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3 sm:mr-4 ring-2 ring-border bg-card"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.1 }}
                  >
                    <img 
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.05 }}
          transition={{ duration: 0.3, delay: 0.38 }}
        >
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: false, amount: 0.05 }}
            transition={{ duration: 0.4, delay: 0.43 }}
          >
            {[
              "SOC2 Certified",
              "99.9% Uptime", 
              "24/7 Support",
              "GDPR Compliant"
            ].map((badge, index) => (
              <motion.div
                key={badge}
                className="flex items-center gap-4 sm:gap-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.05 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.05 }}
              >
                <div className="text-muted-foreground font-semibold text-xs sm:text-sm">{badge}</div>
                {index < 3 && (
                  <motion.div 
                    className="w-1 h-1 bg-border rounded-full hidden sm:block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: false, amount: 0.05 }}
                    transition={{ duration: 0.25, delay: 0.95 + index * 0.05 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
