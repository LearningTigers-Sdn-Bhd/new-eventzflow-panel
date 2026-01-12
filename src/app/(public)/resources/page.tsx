import type { Metadata } from "next";
import BlogPageClient from "./page-client";

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

export default function BlogPage() {
	return <BlogPageClient />;
}
