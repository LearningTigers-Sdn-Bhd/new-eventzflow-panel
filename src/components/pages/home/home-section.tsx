"use client";

import BenefitsSection from "./sections/BenefitsSection";
import CTASection from "./sections/CTASection";
import FAQSection from "./sections/FAQSection";
import FeatureShowcaseSection from "./sections/FeatureShowcaseSection";
import HeroSection from "./sections/HeroSection";
import JourneySection from "./sections/JourneySection";
import KioskCheckInSection from "./sections/KioskCheckInSection";
import MobileCheckInSection from "./sections/MobileCheckInSection";
import OnsiteSupportSection from "./sections/OnsiteSupportSection";
import SolutionsGallerySection from "./sections/SolutionsGallerySection";
import SolutionsRibbon from "./sections/SolutionsRibbon";
import TargetAudienceSection from "./sections/TargetAudienceSection";
import TestimonialsSection from "./sections/TestimonialsSection";

export default function HomeSection() {
	return (
		<div className="w-full">
			{/* 1. HOOK - Capture Attention */}
			<HeroSection />
			<BenefitsSection />

			{/* 2. CREDIBILITY - Build Trust Early */}
			<TargetAudienceSection />
			<TestimonialsSection />

			{/* 3. VALUE PROPOSITION - Why Choose Us */}
			<JourneySection />

			{/* 4. FEATURES - Deep Dive (Grouped by Journey) */}
			<FeatureShowcaseSection />
			<MobileCheckInSection />
			<KioskCheckInSection />

			{/* 5. VISUAL PROOF - Show Don't Tell */}
			<OnsiteSupportSection />
			<SolutionsGallerySection />

			{/* 6. CONVERSION FUNNEL - Push to Action */}
			<SolutionsRibbon />
			<FAQSection />
			<CTASection />
		</div>
	);
}
