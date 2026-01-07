"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/event-registration/CTASection";
import FeaturesSection from "@/components/pages/services/event-registration/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/event-registration/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/event-registration/ShowcaseSection";

export default function EventRegistrationPage() {
	return (
		<main>
			<ServiceHero
				title="Event"
				titleOutline="Registration"
				tagline="RSVP, Ticketing & WhatsApp"
				description="Seamless registration experience with multiple channels including web forms, WhatsApp automation, and QR code scanning. Collect attendee information effortlessly."
				heroImage="/images/services/hero/EventRegistration.png"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
