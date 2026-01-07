"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/exhibitor-management/CTASection";
import FeaturesSection from "@/components/pages/services/exhibitor-management/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/exhibitor-management/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/exhibitor-management/ShowcaseSection";

export default function ExhibitorManagementPage() {
	return (
		<main>
			<ServiceHero
				title="Exhibitor"
				titleOutline="Management"
				tagline="Booth Portal & Team Management"
				description="Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement at your event."
				heroImage="/images/services/hero/ExhibitorManagement.png"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
