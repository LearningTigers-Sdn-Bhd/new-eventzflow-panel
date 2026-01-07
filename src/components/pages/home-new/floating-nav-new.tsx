"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CreditCard,
  Gift,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Printer,
  Settings,
  Smartphone,
  Store,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

const services = [
  // Core features - high SEO value
  {
    icon: CreditCard,
    label: "Event Registration",
    description: "RSVP, ticketing & WhatsApp",
    href: "/services/event-registration",
  },
  {
    icon: Printer,
    label: "Check-In & Badge Printing",
    description: "On-site kiosk & instant badges",
    href: "/services/check-in-badge-printing",
  },
  // Management features
  {
    icon: Users,
    label: "Attendee Management",
    description: "Complete visitor & guest control",
    href: "/services/attendee-management",
  },
  {
    icon: Store,
    label: "Exhibitor Management",
    description: "Booth portal & lead tracking",
    href: "/services/exhibitor-management",
  },
  // Engagement features
  {
    icon: Handshake,
    label: "Business Matching",
    description: "AI-powered networking & meetings",
    href: "/services/business-matching",
  },
  {
    icon: Gift,
    label: "Lucky Draw System",
    description: "Interactive giveaways & prizes",
    href: "/services/lucky-draw",
  },
  // Analytics & Tech
  {
    icon: BarChart3,
    label: "Event Analytics",
    description: "Real-time insights & reporting",
    href: "/services/event-analytics",
  },
  {
    icon: Smartphone,
    label: "Appless Web Portal",
    description: "No app download needed",
    href: "/services/appless-web-portal",
  },
];

export default function FloatingNavNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash navigation when landing on the page
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const elementPosition = element.offsetTop;
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [pathname]);

  const scrollToSection = (sectionId: string) => {
    const isHomePage = pathname === "/";

    if (!isHomePage) {
      router.push(`/#${sectionId}`);
      setIsOpen(false);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  };

  const scrollToTop = () => {
    const isHomePage = pathname === "/";

    if (!isHomePage) {
      router.push("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const resources = [
    { icon: HelpCircle, label: "FAQs", href: "/faqs" },
    { icon: BookOpen, label: "Blogs", href: "/blogs" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/95 backdrop-blur-xl shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12">
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="group flex items-center transition-all duration-300"
          >
            <span
              className="font-bold text-xl leading-tight lg:text-2xl"
              style={{ fontFamily: "Times New Roman, serif" }}
            >
              <span style={{ color: "#23c460" }}>Event</span>
              <span style={{ color: "#2766ec" }}>z</span>
              <span style={{ color: "#23c460" }}>Flow</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="flex items-center gap-1 px-5 py-2 text-xs font-medium tracking-widest text-white/60 transition-all duration-300 hover:text-white">
                SERVICES
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
                  >
                    <div className="w-[550px] border border-white/10 bg-black/95 backdrop-blur-xl p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {services.map((service, index) => {
                          const IconComponent = service.icon;
                          return (
                            <Link
                              key={index}
                              href={service.href}
                              onClick={() => setServicesOpen(false)}
                              className="group flex items-start gap-3 p-3 text-left transition-all duration-200 hover:bg-white"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 text-white/50 transition-all duration-200 group-hover:border-black group-hover:text-black">
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white/80 transition-colors duration-200 group-hover:text-black">
                                  {service.label}
                                </p>
                                <p className="text-xs text-white/40 transition-colors duration-200 group-hover:text-black/60">
                                  {service.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button className="flex items-center gap-1 px-5 py-2 text-xs font-medium tracking-widest text-white/60 transition-all duration-300 hover:text-white">
                RESOURCES
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-300 ${resourcesOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 top-full -translate-x-1/2 pt-2"
                  >
                    <div className="w-[200px] border border-white/10 bg-black/95 backdrop-blur-xl p-3">
                      <div className="flex flex-col gap-1">
                        {resources.map((resource, index) => {
                          const IconComponent = resource.icon;
                          return (
                            <Link
                              key={index}
                              href={resource.href}
                              onClick={() => setResourcesOpen(false)}
                              className="group flex items-center gap-3 p-3 text-left transition-all duration-200 hover:bg-white"
                            >
                              <IconComponent className="h-4 w-4 text-white/50 transition-colors duration-200 group-hover:text-black" />
                              <span className="text-sm font-medium text-white/80 transition-colors duration-200 group-hover:text-black">
                                {resource.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Us */}
            <Link
              href="/about"
              className="relative px-5 py-2 text-xs font-medium tracking-widest text-white/60 transition-all duration-300 hover:text-white"
            >
              ABOUT US
            </Link>

            {/* Contact Us */}
            <Link
              href="/contact"
              className="relative px-5 py-2 text-xs font-medium tracking-widest text-white/60 transition-all duration-300 hover:text-white"
            >
              CONTACT US
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              /* User Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-2 py-1 transition-all duration-300 hover:opacity-80">
                    <Avatar className="h-8 w-8 border border-white/30">
                      <AvatarFallback className="bg-white text-black text-sm font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm text-white lg:block">
                      {user.full_name || "User"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-card rounded-none"
                  side="bottom"
                  align="end"
                >
                  <DropdownMenuLabel>
                    <div className="flex min-w-48 flex-col gap-1">
                      <h3 className="font-medium text-sm">My Account</h3>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-none">
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none">
                    <Link href="/settings">
                      <Settings />
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="group cursor-pointer rounded-none bg-destructive text-white transition-colors hover:bg-destructive/90 hover:text-red-950"
                    onClick={async () => {
                      await logout();
                      router.push("/");
                    }}
                  >
                    <LogOut className="text-white transition-colors group-hover:text-red-950" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* CTA Button - Desktop (only when not logged in) */
              <button
                onClick={() => router.push("/auth?login")}
                className="hidden border border-white px-6 py-2.5 text-xs font-bold tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black lg:block"
              >
                GET STARTED
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-10 w-10 items-center justify-center border border-white/30 text-white transition-all duration-300 hover:border-white lg:hidden"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Subtle bottom line when scrolled */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[73px] right-0 left-0 z-40 overflow-hidden bg-black/98 backdrop-blur-xl lg:hidden"
          >
            <div className="border-t border-white/10">
              <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Mobile Services Section */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      scrollToSection("capabilities");
                      setIsOpen(false);
                    }}
                    className="group flex items-center justify-between border-b border-white/10 py-4 text-left w-full"
                  >
                    <span className="text-sm font-medium tracking-widest text-white/60 transition-colors duration-200 group-hover:text-white">
                      SERVICES
                    </span>
                    <span className="text-xs text-white/20">8 features</span>
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-1">
                  {/* Resources - FAQs */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                  >
                    <Link
                      href="/faqs"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-left"
                    >
                      <span className="text-sm font-medium tracking-widest text-white/60 transition-colors duration-200 group-hover:text-white">
                        FAQS
                      </span>
                    </Link>
                  </motion.div>

                  {/* Resources - Blogs */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  >
                    <Link
                      href="/blogs"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-left"
                    >
                      <span className="text-sm font-medium tracking-widest text-white/60 transition-colors duration-200 group-hover:text-white">
                        BLOGS
                      </span>
                    </Link>
                  </motion.div>

                  {/* About Us */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Link
                      href="/about"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-left"
                    >
                      <span className="text-sm font-medium tracking-widest text-white/60 transition-colors duration-200 group-hover:text-white">
                        ABOUT US
                      </span>
                    </Link>
                  </motion.div>

                  {/* Contact Us */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <Link
                      href="/contact"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between border-b border-white/10 py-4 text-left"
                    >
                      <span className="text-sm font-medium tracking-widest text-white/60 transition-colors duration-200 group-hover:text-white">
                        CONTACT US
                      </span>
                    </Link>
                  </motion.div>
                </div>

                {/* Mobile CTA */}
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="mt-8 block w-full border border-white bg-white py-4 text-center text-xs font-bold tracking-widest text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                  >
                    GO TO DASHBOARD
                  </Link>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={() => {
                      router.push("/auth?login");
                      setIsOpen(false);
                    }}
                    className="mt-8 w-full border border-white bg-white py-4 text-center text-xs font-bold tracking-widest text-black transition-all duration-300 hover:bg-transparent hover:text-white"
                  >
                    GET STARTED
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
