import { Metadata } from "next";
import BlogPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Blog - EventzFlow",
	description:
		"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
	openGraph: {
		title: "Blog - EventzFlow",
		description:
			"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
		url: "https://eventzflow.com/blog",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function BlogPage() {
	return <BlogPageClient />;
}
