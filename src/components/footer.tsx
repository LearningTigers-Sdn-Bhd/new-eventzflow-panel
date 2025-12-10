"use client";

import type React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { Route } from 'next';
import { 
  Zap, 
  Mail, 
  ArrowUp,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

type FooterLink = {
  label: string;
  id?: string | null;
  href?: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const footerSections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { label: "Industries", id: "industries" },
        { label: "Testimonials", id: "testimonials" },
        { label: "Features", id: "features" },
        { label: "Solutions", id: "solutions" },
        { label: "FAQ", id: "faq" }
      ]
    },
    {
      title: "Resources", 
      links: [
        { label: "Why Us?", id: "pain-points" },
        { label: "WhatsApp Registration", href: "/whatsapp-registration" },
        { label: "On-site Check-in", href: "/check-in" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About EventzFlow", href: "/about" },
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
    // Check if we're on the home page
    const isHomePage = pathname === "/";
    
    if (!isHomePage) {
      // If not on home page, navigate to home page with hash
      router.push(`/#${sectionId}`);
      return;
    }

    // If on home page, scroll to section
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
    <footer className="overflow-x-hidden bg-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-6 py-12 sm:gap-8 sm:py-16 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center space-x-3 border-border border-b pb-4 sm:mb-6">
              <div className="flex flex-col">
                <span className="font-bold text-2xl leading-tight sm:text-3xl" style={{ fontFamily: 'Times New Roman, serif' }}>
                  <span style={{ color: '#23c460' }}>Event</span>
                  <span style={{ color: '#2766ec' }}>z</span>
                  <span style={{ color: '#23c460' }}>Flow</span>
                </span>
                <span className="-mt-1 font-medium text-muted-foreground text-xs">
                  by Sales Chatalyst
                </span>
              </div>
            </div>
            
            <p className="mb-4 max-w-md text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
              Complete event ticketing and management platform with integrated Sales Chatalyst 
              for automated attendee engagement and communications.
            </p>

            {/* Newsletter */}
            <div className="mb-4 sm:mb-6">
              <h4 className="mb-2 font-semibold text-foreground text-sm sm:mb-3 sm:text-base">Event Management Tips</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border border-primary bg-input px-3 py-2 text-foreground text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:rounded-lg sm:px-4 sm:py-2 sm:text-base"
                />
                <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground transition-all duration-200 hover:shadow-lg sm:rounded-lg sm:px-4 sm:py-2">
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
                    className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-foreground sm:h-10 sm:w-10 sm:rounded-lg"
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
              <h4 className="mb-3 font-semibold text-foreground text-sm sm:mb-4 sm:text-base">{section.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.id ? (
                      <button
                        type="button"
                        onClick={() => link.id && scrollToSection(link.id)}
                        className="cursor-pointer text-muted-foreground text-xs leading-relaxed transition-colors duration-200 hover:text-foreground sm:text-sm"
                      >
                        {link.label}
                      </button>
                    ) : link.href ? (
                      <Link
                        href={link.href as Route}
                        className="text-muted-foreground text-xs leading-relaxed transition-colors duration-200 hover:text-foreground sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-muted-foreground text-xs leading-relaxed transition-colors duration-200 hover:text-foreground sm:text-sm"
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
        <div className="flex flex-col items-center justify-between gap-3 border-t py-6 sm:gap-4 sm:py-8 md:flex-row">
          {/* Copyright */}
          <div className="text-center text-muted-foreground text-xs sm:text-sm md:text-left">
            © 2025 EventzFlow by Sales Chatalyst. All rights reserved.
          </div>

          {/* Legal Links */}
          <div className="flex items-center space-x-4 text-xs sm:space-x-6 sm:text-sm">
            <a href="/privacy-policy" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" className="text-muted-foreground transition-colors duration-200 hover:text-foreground">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
