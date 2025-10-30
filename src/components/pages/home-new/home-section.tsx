"use client";

import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import WhatsAppDemo from "./sections/WhatsAppDemo";
import CTASection from "./sections/CTASection";
import Footer from "../home/sections/Footer";

export default function HomeSection() {
	return (
		<div className="w-full">
			<HeroSection />
			<FeaturesSection />
			<WhatsAppDemo />
			<CTASection />
			<Footer />
		</div>
	);
}

