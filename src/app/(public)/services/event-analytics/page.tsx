import type { Metadata } from "next";
import EventAnalyticsPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Event Analytics - EventzFlow",
	description:
		"Real-time insights & reporting. See real-time data on attendance, engagement, and conversions. Make data-driven decisions with comprehensive analytics and exportable reports.",
	openGraph: {
		title: "Event Analytics - EventzFlow",
		description:
			"Real-time insights & reporting. See real-time data on attendance, engagement, and conversions. Make data-driven decisions with comprehensive analytics.",
		url: "https://eventzflow.com/services/event-analytics",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function EventAnalyticsPage() {
	return <EventAnalyticsPageClient />;
}
