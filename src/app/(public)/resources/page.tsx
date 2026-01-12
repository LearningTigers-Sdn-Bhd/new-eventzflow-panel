import type { Metadata } from "next";
import ResourcesPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Resources - EventzFlow",
	description:
		"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
	openGraph: {
		title: "Resources - EventzFlow",
		description:
			"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
		url: "https://eventzflow.com/resources",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

// url "/resources"
// A page that displays a list of featured resources.
export default async function ResourcesPage() {
	return <ResourcesPageClient />;
}
