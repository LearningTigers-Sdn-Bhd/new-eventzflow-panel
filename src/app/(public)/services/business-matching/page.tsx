import { Metadata } from "next";
import BusinessMatchingPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Business Matching - EventzFlow",
	description:
		"Meeting scheduling & networking. Connect the right people at your event. Facilitate meaningful connections between attendees, exhibitors, and sponsors with easy meeting bookings.",
	openGraph: {
		title: "Business Matching - EventzFlow",
		description:
			"Meeting scheduling & networking. Connect the right people at your event. Facilitate meaningful connections with easy meeting bookings.",
		url: "https://eventzflow.com/services/business-matching",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function BusinessMatchingPage() {
	return <BusinessMatchingPageClient />;
}
