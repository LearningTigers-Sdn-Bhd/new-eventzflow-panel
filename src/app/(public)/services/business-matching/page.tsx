"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/business-matching/CTASection";
import FeaturesSection from "@/components/pages/services/business-matching/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/business-matching/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/business-matching/ShowcaseSection";

export default function BusinessMatchingPage() {
	return (
		<main>
			<ServiceHero
				title="Business"
				titleOutline="Matching"
				tagline="Meeting Scheduling & Networking"
				description="Connect the right people at your event. Facilitate meaningful connections between attendees, exhibitors, and sponsors with easy meeting bookings."
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
