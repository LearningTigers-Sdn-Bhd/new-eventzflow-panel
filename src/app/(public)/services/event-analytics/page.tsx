"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/event-analytics/CTASection";
import FeaturesSection from "@/components/pages/services/event-analytics/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/event-analytics/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/event-analytics/ShowcaseSection";

export default function EventAnalyticsPage() {
	return (
		<main>
			<ServiceHero
				title="Event"
				titleOutline="Analytics"
				tagline="Real-time Insights & Reporting"
				description="See real-time data on attendance, engagement, and conversions. Make data-driven decisions with comprehensive analytics and exportable reports."
				heroImage="/images/services/hero/EventAnalytics.png"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
