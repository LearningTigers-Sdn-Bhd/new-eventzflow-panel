import type { Metadata } from "next";
import TermsAndConditionsPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Terms & Conditions - EventzFlow",
	description:
		"Read EventzFlow's terms and conditions. These terms govern your access to and use of our event management platform, website, and services.",
	openGraph: {
		title: "Terms & Conditions - EventzFlow",
		description:
			"Read EventzFlow's terms and conditions. These terms govern your access to and use of our event management platform and services.",
		url: "https://eventzflow.com/terms-and-conditions",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function TermsAndConditionsPage() {
	return <TermsAndConditionsPageClient />;
}
