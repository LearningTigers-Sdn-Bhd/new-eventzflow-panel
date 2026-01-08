import { Metadata } from "next";
import EventRegistrationPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Event Registration - EventzFlow",
	description:
		"RSVP, ticketing & WhatsApp. Seamless registration experience with multiple channels including web forms, WhatsApp automation, and QR code scanning. Collect attendee information effortlessly.",
	openGraph: {
		title: "Event Registration - EventzFlow",
		description:
			"RSVP, ticketing & WhatsApp. Seamless registration with web forms, WhatsApp automation, and QR code scanning. Collect attendee information effortlessly.",
		url: "https://eventzflow.com/services/event-registration",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function EventRegistrationPage() {
	return <EventRegistrationPageClient />;
}
