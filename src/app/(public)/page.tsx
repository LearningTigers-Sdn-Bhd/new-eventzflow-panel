import type { Metadata } from "next";
import HomeSection from "@/components/pages/home/home-section";

export const metadata: Metadata = {
	title: "EventzFlow - All in One Event Management Platform",
	description:
		"Streamline your event management with ticketing, check-in, business matching, lucky draw, and more.",
	applicationName: "EventzFlow",
	keywords: [
		"event management",
		"event ticketing",
		"event check-in",
		"event business matching",
		"event lucky draw",
	],
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
	openGraph: {
		title: "EventzFlow",
		description:
			"Streamline your event management with ticketing, check-in, business matching, lucky draw, and more.",
		url: "https://eventzflow.com",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/api/og?title=EventzFlow&subtitle=All in One Event Management Platform",
				width: 1200,
				height: 630,
				alt: "EventzFlow",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "EventzFlow",
		description:
			"Streamline your event management with ticketing, check-in, business matching, lucky draw, and more.",
		images: ["/images/homepage/Conference.png"],
	},
};

export default function Home() {
	return (
		<div className="w-full">
			<HomeSection />
		</div>
	);
}
