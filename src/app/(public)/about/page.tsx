import type { Metadata } from "next";
import type React from "react";
import { ApproachSection } from "@/components/pages/about/ApproachSection";
import { ContactSection } from "@/components/pages/about/ContactSection";
import { HeroSection } from "@/components/pages/about/HeroSection";
import { StorySection } from "@/components/pages/about/StorySection";
import { ValuesSection } from "@/components/pages/about/ValuesSection";

export const metadata: Metadata = {
	title: "EventzFlow - About",
	description:
		"Learn more about EventzFlow and our mission to help event organizers succeed.",
	applicationName: "EventzFlow",
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
	openGraph: {
		title: "EventzFlow - About",
		description:
			"Learn more about EventzFlow and our mission to help event organizers succeed.",
		url: "https://eventzflow.com",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/api/og?title=About EventzFlow&subtitle=Learn more about EventzFlow and our mission to help event organizers succeed.",
				width: 1200,
				height: 630,
				alt: "EventzFlow",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "EventzFlow - About",
		description:
			"Learn more about EventzFlow and our mission to help event organizers succeed.",
		images: [
			"/api/og?title=About EventzFlow&subtitle=Learn more about EventzFlow and our mission to help event organizers succeed.",
		],
	},
};

const AboutPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-background">
			<HeroSection />
			<StorySection />
			<ValuesSection />
			<ApproachSection />
			<ContactSection />
		</div>
	);
};

export default AboutPage;
