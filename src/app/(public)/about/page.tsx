"use client";

import React from 'react';
import FloatingNav from '@/components/pages/home/sections/FloatingNav';
import Footer from '@/components/pages/home/sections/Footer';
import { HeroSection } from '@/components/pages/about/HeroSection';
import { StorySection } from '@/components/pages/about/StorySection';
import { ValuesSection } from '@/components/pages/about/ValuesSection';
import { ApproachSection } from '@/components/pages/about/ApproachSection';
import { ContactSection } from '@/components/pages/about/ContactSection';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <HeroSection />
      <StorySection />
      <ValuesSection />
      <ApproachSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default AboutPage;
