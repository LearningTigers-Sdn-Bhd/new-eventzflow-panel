"use client";

import React from 'react';
import { 
  Users, 
  Building2, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  TrendingUp,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface TargetAudience {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  stats: { 
    left: { value: string; label: string };
    right: { value: string; label: string };
  };
  imageUrl: string;
}

const TargetAudience: React.FC = () => {
  // EventzFlow Brand Colors (matching HeroSection)
  const colors = {
    primary: '#22C55E',    // EventzFlow Green
    blue: '#3B82F6',       // EventzFlow Blue
    lightGreen: '#4ADE80', // Light Green accent
  };

  const targetAudiences: TargetAudience[] = [
    {
      icon: Users,
      title: "Event Planners",
      description: "Professional event coordinators managing multiple events simultaneously",
      benefits: [
        "Streamline event planning workflows",
        "Centralized vendor coordination",
        "Real-time status tracking"
      ],
      color: "from-blue-500 to-cyan-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      emoji: "🎯",
      stats: { 
        left: { value: "10x", label: "Faster Setup" },
        right: { value: "500+", label: "Events/Year" }
      },
      imageUrl: "/images/homepage/Event-Planner.png"
    },
    {
      icon: Building2,
      title: "Corporate Entities",
      description: "Businesses hosting conferences, product launches, and corporate events",
      benefits: [
        "Professional branded experiences",
        "Employee engagement analytics",
        "Corporate tool integration"
      ],
      color: "from-emerald-500 to-green-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      emoji: "🏢",
      stats: { 
        left: { value: "85%", label: "ROI Increase" },
        right: { value: "5K+", label: "Attendees" }
      },
      imageUrl: "/images/homepage/Corporate.png"
    },
    {
      icon: Heart,
      title: "Non-Profit Organizations",
      description: "Charities organizing fundraising events and awareness campaigns",
      benefits: [
        "Cost-effective solutions",
        "Donation tracking tools",
        "Volunteer coordination"
      ],
      color: "from-pink-500 to-rose-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      emoji: "❤️",
      stats: { 
        left: { value: "$2M+", label: "Funds Raised" },
        right: { value: "60%", label: "Cost Savings" }
      },
      imageUrl: "/images/homepage/Non-Profit.png"
    },
    {
      icon: GraduationCap,
      title: "Educational Institutions",
      description: "Schools and universities conducting academic events and workshops",
      benefits: [
        "Student attendance management",
        "Academic resource distribution",
        "Faculty communication tools"
      ],
      color: "from-orange-500 to-amber-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      emoji: "🎓",
      stats: { 
        left: { value: "50K+", label: "Students" },
        right: { value: "98%", label: "Attendance" }
      },
      imageUrl: "/images/homepage/Educational.png"
    },
    {
      icon: Briefcase,
      title: "Government Agencies",
      description: "Public sector organizations arranging official events",
      benefits: [
        "Compliant security protocols",
        "Transparency reporting",
        "Multi-language support"
      ],
      color: "from-purple-500 to-violet-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      emoji: "🏛️",
      stats: { 
        left: { value: "100%", label: "Compliant" },
        right: { value: "15+", label: "Languages" }
      },
      imageUrl: "/images/homepage/Government.png"
    },
    {
      icon: TrendingUp,
      title: "Conference Organizers",
      description: "Specialists managing trade shows, expos, and conventions",
      benefits: [
        "Exhibitor booth coordination",
        "Large-scale registration",
        "Networking facilitation"
      ],
      color: "from-indigo-500 to-blue-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      emoji: "📊",
      stats: { 
        left: { value: "10K+", label: "Attendees" },
        right: { value: "500+", label: "Exhibitors" }
      },
      imageUrl: "/images/homepage/Conference.png"
    },
    {
      icon: Users,
      title: "Private Event Hosts",
      description: "Individuals organizing weddings, parties, and celebrations",
      benefits: [
        "Guest list & RSVP tracking",
        "Custom invitation designs",
        "Vendor management"
      ],
      color: "from-purple-500 to-pink-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      emoji: "🎉",
      stats: { 
        left: { value: "99%", label: "Happy Hosts" },
        right: { value: "2K+", label: "Events" }
      },
      imageUrl: "/images/homepage/Private-Event.png"
    }
  ];

  // Duplicate the array for infinite loop effect
  const duplicatedAudiences = [...targetAudiences, ...targetAudiences];

  return (
    <section id="who-needs-our-service" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-4 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-4 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-md border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">Perfect for Every Event Creator</span>
          </motion.div>
          
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight px-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Built For Every
            <br />
            <span 
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`
              }}
            >
              Event Professional
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            No matter your industry, EventzFlow adapts to your needs
          </motion.p>
        </motion.div>

        {/* Infinite Ticker Carousel */}
        <div className="relative -mx-4 sm:mx-0">
          <motion.div 
            className="flex gap-3 sm:gap-4 md:gap-6 pl-4 sm:pl-0"
            animate={{
              x: [0, -((280 + 12) * targetAudiences.length)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear",
              },
            }}
          >
            {duplicatedAudiences.map((audience, index) => {
              const IconComponent = audience.icon;
              return (
                <motion.div
                  key={index}
                  className={`flex-shrink-0 w-64 sm:w-72 md:w-80 rounded-xl sm:rounded-2xl border ${audience.borderColor} ${audience.bgColor} backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % targetAudiences.length) * 0.1 }}
                >
                  {/* Card Image */}
                  <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                    <img 
                      src={audience.imageUrl}
                      alt={audience.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                    {/* Icon & Title */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className={`inline-flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r ${audience.color} px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg`}>
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        <span className="text-[10px] sm:text-xs font-semibold text-white">Target Audience</span>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold leading-tight">
                        {audience.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {audience.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between py-2 sm:py-3 border-y border-border/50">
                      <div className="text-center flex-1">
                        <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                          {audience.stats.left.value}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {audience.stats.left.label}
                        </p>
                      </div>
                      <div className="h-6 sm:h-8 w-px bg-border" />
                      <div className="text-center flex-1">
                        <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                          {audience.stats.right.value}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {audience.stats.right.label}
                        </p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-1.5 sm:space-y-2">
                      {audience.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5 sm:space-x-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] sm:text-xs leading-relaxed">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TargetAudience;
