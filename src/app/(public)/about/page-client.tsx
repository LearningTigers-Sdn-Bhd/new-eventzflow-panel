"use client";

import ApproachSection from "@/components/pages/about/ApproachSection";
import CTASection from "@/components/pages/about/CTASection";
import HeroSection from "@/components/pages/about/HeroSection";
import QuoteSection from "@/components/pages/about/QuoteSection";
import StorySection from "@/components/pages/about/StorySection";
import ValuesSection from "@/components/pages/about/ValuesSection";

export default function AboutPageClient() {
	return (
		<main>
			<HeroSection />
			<StorySection />
			<ValuesSection />
			<ApproachSection />
			<QuoteSection />
			<CTASection />
		</main>
	);
}
