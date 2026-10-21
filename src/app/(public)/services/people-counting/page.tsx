import type { Metadata } from "next";
import PeopleCountingPageClient from "./page-client";

export const metadata: Metadata = {
	title: "People Counting & Footfall Analytics - EventzFlow",
	description:
		"Real-time headcount with IR people counters. Track entries, exits and occupancy per hall, get capacity alerts and footfall trends for your event.",
	openGraph: {
		title: "People Counting & Footfall Analytics - EventzFlow",
		description:
			"Real-time headcount with IR people counters. Track entries, exits and occupancy per hall with capacity alerts and footfall trends.",
		url: "https://eventzflow.com/services/people-counting",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function PeopleCountingPage() {
	return <PeopleCountingPageClient />;
}
