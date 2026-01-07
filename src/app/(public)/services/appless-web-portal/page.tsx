"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/appless-web-portal/CTASection";
import FeaturesSection from "@/components/pages/services/appless-web-portal/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/appless-web-portal/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/appless-web-portal/ShowcaseSection";

export default function ApplessWebPortalPage() {
	return (
		<main>
			<ServiceHero
				title="Appless"
				titleOutline="Portal"
				tagline="No App Download Needed"
				description="EventzFlow works directly in your browser as a Progressive Web App. Access all features instantly - no app store, no downloads, no waiting."
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
