import type { Metadata } from "next";
import AboutPageClient from "./page-client";

export const metadata: Metadata = {
	title: "About Us - EventzFlow",
	description:
		"Learn about EventzFlow's mission to empower event organizers with powerful, easy-to-use tools that make event management seamless.",
	openGraph: {
		title: "About Us - EventzFlow",
		description:
			"Learn about EventzFlow's mission to empower event organizers with powerful, easy-to-use tools that make event management seamless.",
		url: "https://eventzflow.com/about",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function AboutPage() {
	return <AboutPageClient />;
}
