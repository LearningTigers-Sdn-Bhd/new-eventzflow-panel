import type { Metadata } from "next";
import PrivacyPolicyPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Privacy Policy - EventzFlow",
	description:
		"Learn how EventzFlow collects, uses, and protects your personal information. We are committed to maintaining the privacy and security of your data in compliance with GDPR and PDPA.",
	openGraph: {
		title: "Privacy Policy - EventzFlow",
		description:
			"Learn how EventzFlow collects, uses, and protects your personal information. Committed to GDPR and PDPA compliance.",
		url: "https://eventzflow.com/privacy-policy",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function PrivacyPolicyPage() {
	return <PrivacyPolicyPageClient />;
}
