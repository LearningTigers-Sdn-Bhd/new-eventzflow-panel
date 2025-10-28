"use client";

import React from 'react';
import { 
  Zap, 
  Mail, 
  ArrowUp,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Features", id: "feature-showcase" },
        { label: "Solutions", id: "pain-points" },
        { label: "Integrations", id: "integrations-section" },
        { label: "Demo", id: "product-demo" },
        // { label: "Pricing", id: "pricing-plans" }
      ]
    },
    {
      title: "Support", 
      links: [
        { label: "Help Center", id: null },
        { label: "Documentation", id: null },
        { label: "Contact Support", id: null },
        { label: "FAQ", id: "faq" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About EventzFlow", id: null },
      ]
    }
  ];

  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/60177268130", label: "WhatsApp" },
    { icon: Mail, href: "mailto:info@saleschatalyst.com", label: "Email" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-primary/10 border-t border overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold leading-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <span style={{ color: '#23c460' }}>Event</span>
                  <span style={{ color: '#2766ec' }}>z</span>
                  <span style={{ color: '#23c460' }}>Flow</span>
                </span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">
                  by Sales Chatalyst
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-md mb-4 sm:mb-6 text-sm sm:text-base">
              Complete event ticketing and management platform with integrated Sales Chatalyst 
              for automated attendee engagement and communications.
            </p>

            {/* Newsletter */}
            <div className="mb-4 sm:mb-6">
              <h4 className="text-foreground font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Event Management Tips</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-input border border-primary rounded-md sm:rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
                />
                <button className="bg-primary text-primary-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg hover:shadow-lg transition-all duration-200">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-card border rounded-md sm:rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors duration-200"
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.id ? (
                      <button
                        onClick={() => scrollToSection(link.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-xs sm:text-sm leading-relaxed cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-xs sm:text-sm leading-relaxed"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t py-6 sm:py-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          {/* Copyright */}
          <div className="text-muted-foreground text-xs sm:text-sm text-center md:text-left">
            © 2025 EventzFlow by Sales Chatalyst. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
            <a href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Terms & Conditions
            </a>
            <a href="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Refund & Booking Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
