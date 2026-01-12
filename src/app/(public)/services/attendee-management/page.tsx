import { Metadata } from "next";
import AttendeeManagementPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Attendee Management - EventzFlow",
	description:
		"Complete visitor & guest control. Manage your event attendees with ease. Register guests, import from spreadsheets, and access complete profiles with custom fields and unique QR codes.",
	openGraph: {
		title: "Attendee Management - EventzFlow",
		description:
			"Complete visitor & guest control. Manage your event attendees with ease. Register guests, import from spreadsheets, and access complete profiles.",
		url: "https://eventzflow.com/services/attendee-management",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function AttendeeManagementPage() {
	return <AttendeeManagementPageClient />;
}
