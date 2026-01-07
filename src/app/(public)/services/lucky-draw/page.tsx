"use client";

import ServiceHero from "@/components/pages/services/ServiceHero";
import CTASection from "@/components/pages/services/lucky-draw/CTASection";
import FeaturesSection from "@/components/pages/services/lucky-draw/FeaturesSection";
import HowItWorksSection from "@/components/pages/services/lucky-draw/HowItWorksSection";
import ShowcaseSection from "@/components/pages/services/lucky-draw/ShowcaseSection";

export default function LuckyDrawPage() {
	return (
		<main>
			<ServiceHero
				title="Lucky"
				titleOutline="Draw"
				tagline="Interactive Giveaways & Prizes"
				description="Engage your audience with exciting lucky draws and giveaways. Run multiple sessions, track winners, and create memorable moments at your event."
				heroImage="/images/services/hero/LuckyDraw.png"
			/>
			<FeaturesSection />
			<HowItWorksSection />
			<ShowcaseSection />
			<CTASection />
		</main>
	);
}
