import { Metadata } from "next";
import ExhibitorManagementPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Exhibitor Management - EventzFlow",
	description:
		"Booth portal & team management. Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement at your event.",
	openGraph: {
		title: "Exhibitor Management - EventzFlow",
		description:
			"Booth portal & team management. Give exhibitors their own portal to manage booth details, add team members, and track visitor engagement.",
		url: "https://eventzflow.com/services/exhibitor-management",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function ExhibitorManagementPage() {
	return <ExhibitorManagementPageClient />;
}
