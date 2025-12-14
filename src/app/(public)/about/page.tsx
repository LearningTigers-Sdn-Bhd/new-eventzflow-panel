"use client";

import type React from "react";
import { ApproachSection } from "@/components/pages/about/ApproachSection";
import { ContactSection } from "@/components/pages/about/ContactSection";
import { HeroSection } from "@/components/pages/about/HeroSection";
import { StorySection } from "@/components/pages/about/StorySection";
import { ValuesSection } from "@/components/pages/about/ValuesSection";

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
