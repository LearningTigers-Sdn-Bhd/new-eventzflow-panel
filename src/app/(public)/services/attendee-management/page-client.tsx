"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/attendee-management/CTASection";
import FeaturesSection from "@/components/pages/services/attendee-management/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/attendee-management/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/attendee-management/ShowcaseSection";

export default function AttendeeManagementPageClient() {
	return (
		<main>
			<ServiceHero
				title="Attendee"
				titleOutline="Management"
				tagline="Complete Visitor & Guest Control"
				description="Manage your event attendees with ease. Register guests, import from spreadsheets, and access complete profiles with custom fields and unique QR codes."
				heroImage="/images/services/hero/AttendeeManagement.webp"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}

