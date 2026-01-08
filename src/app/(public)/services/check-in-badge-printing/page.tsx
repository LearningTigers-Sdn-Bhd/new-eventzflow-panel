import { Metadata } from "next";
import CheckInBadgePrintingPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Check-In & Badge Printing - EventzFlow",
	description:
		"On-site kiosk & instant printing. Fast, contactless entry with real-time attendance tracking. Print professional badges on-demand as attendees check in at your event.",
	openGraph: {
		title: "Check-In & Badge Printing - EventzFlow",
		description:
			"On-site kiosk & instant printing. Fast, contactless entry with real-time attendance tracking. Print professional badges on-demand.",
		url: "https://eventzflow.com/services/check-in-badge-printing",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function CheckInBadgePrintingPage() {
	return <CheckInBadgePrintingPageClient />;
}
