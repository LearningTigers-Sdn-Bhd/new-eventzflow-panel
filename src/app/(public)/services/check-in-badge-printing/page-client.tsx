"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/check-in-badge-printing/CTASection";
import FeaturesSection from "@/components/pages/services/check-in-badge-printing/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/check-in-badge-printing/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/check-in-badge-printing/ShowcaseSection";

export default function CheckInBadgePrintingPageClient() {
	return (
		<main>
			<ServiceHero
				title="Check-In"
				titleOutline="& Badges"
				tagline="On-site Kiosk & Instant Printing"
				description="Fast, contactless entry with real-time attendance tracking. Print professional badges on-demand as attendees check in at your event."
				heroImage="/images/services/hero/CheckInBadgePrinting.webp"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}

