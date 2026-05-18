import type { Metadata } from "next";
import ContactPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Contact Us - EventzFlow",
	description:
		"Get in touch with EventzFlow. Reach us via WhatsApp, email, or visit our office in Kota Kinabalu, Sabah.",
	openGraph: {
		title: "Contact Us - EventzFlow",
		description:
			"Get in touch with EventzFlow. Reach us via WhatsApp, email, or visit our office in Kota Kinabalu, Sabah.",
		url: "https://eventzflow.com/contact",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function ContactPage() {
	return <ContactPageClient />;
}
