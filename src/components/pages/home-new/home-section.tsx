"use client";

import BenefitsSection from "./sections/BenefitsSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FAQSection";
import HeroSection from "./sections/HeroSection";
import SectorsSection from "./sections/SectorsSection";
import TestimonialSection from "./sections/TestimonialSection";
import WhyChooseSection from "./sections/WhyChooseSection";

export default function HomeSection() {
	return (
		<div className="w-full">
			<HeroSection />
			<BenefitsSection />
			<WhyChooseSection />
			<SectorsSection />
			<CapabilitiesSection />
			<TestimonialSection />
			<FAQSection />
			<CTASection />
		</div>
	);
}
