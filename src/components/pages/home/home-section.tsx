"use client";

import HeroSection from "./sections/HeroSection";
import FeatureShowcase from "./sections/FeatureShowcase";
import PainPoints from "./sections/PainPoints";
import TargetAudience from "./sections/TargetAudience";
import BenefitsSection from "./sections/BenefitsSection";
import ExhibitionStall from "./sections/ExhibitionStall";
import IntegrationsSection from "./sections/IntegrationsSection";
import ProductDemo from "./sections/ProductDemo";
import SocialProof from "./sections/SocialProof";
// import PricingPlans from "./sections/PricingPlans";
import FAQ from "./sections/FAQ";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";

export default function HomeSection() {
	return (
		<div className="w-full">
			<HeroSection />
			<FeatureShowcase />
			<PainPoints />
			<TargetAudience />
			<BenefitsSection />
			<ExhibitionStall />
			<IntegrationsSection />
			<ProductDemo />
			<SocialProof />
			{/* <PricingPlans /> */}
			<FAQ />
			<FinalCTA />
			<Footer />
		</div>
	);
}
