"use client";

import BenefitsSection from "./sections/BenefitsSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FAQSection";
import GallerySection from "./sections/GallerySection";
import HeroSection from "./sections/HeroSection";
import ProblemSection from "./sections/ProblemSection";
import SectorsSection from "./sections/SectorsSection";
import TestimonialSection from "./sections/TestimonialSection";
import WhyChooseSection from "./sections/WhyChooseSection";

export default function HomeSection() {
	return (
		<div className="w-full">
			<HeroSection />
			<BenefitsSection />
			<ProblemSection />
			<CapabilitiesSection />
			<WhyChooseSection />
			<SectorsSection />
			<GallerySection />
			<TestimonialSection />
			<FAQSection />
			<CTASection />
		</div>
	);
}
