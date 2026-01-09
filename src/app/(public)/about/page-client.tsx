"use client";

import HeroSection from "@/components/pages/about/HeroSection";
import StorySection from "@/components/pages/about/StorySection";
import ValuesSection from "@/components/pages/about/ValuesSection";
import ApproachSection from "@/components/pages/about/ApproachSection";
import QuoteSection from "@/components/pages/about/QuoteSection";
import CTASection from "@/components/pages/about/CTASection";

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
