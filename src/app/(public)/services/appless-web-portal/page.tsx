import type { Metadata } from "next";
import ApplessWebPortalPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Appless Web Portal - EventzFlow",
	description:
		"No app download needed. EventzFlow works directly in your browser as a Progressive Web App. Access all features instantly - no app store, no downloads, no waiting.",
	openGraph: {
		title: "Appless Web Portal - EventzFlow",
		description:
			"No app download needed. EventzFlow works directly in your browser as a Progressive Web App. Access all features instantly.",
		url: "https://eventzflow.com/services/appless-web-portal",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function ApplessWebPortalPage() {
	return <ApplessWebPortalPageClient />;
}
