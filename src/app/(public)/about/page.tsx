"use client";

import React from 'react';
import { HeroSection } from '@/components/pages/about/HeroSection';
import { StorySection } from '@/components/pages/about/StorySection';
import { ValuesSection } from '@/components/pages/about/ValuesSection';
import { ApproachSection } from '@/components/pages/about/ApproachSection';
import { ContactSection } from '@/components/pages/about/ContactSection';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StorySection />
      <ValuesSection />
      <ApproachSection />
      <ContactSection />
    </div>
  );
};

export default AboutPage;
