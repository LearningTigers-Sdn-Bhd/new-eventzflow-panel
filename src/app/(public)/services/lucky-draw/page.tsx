import { Metadata } from "next";
import LuckyDrawPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Lucky Draw - EventzFlow",
	description:
		"Interactive giveaways & prizes. Engage your audience with exciting lucky draws and giveaways. Run multiple sessions, track winners, and create memorable moments at your event.",
	openGraph: {
		title: "Lucky Draw - EventzFlow",
		description:
			"Interactive giveaways & prizes. Engage your audience with exciting lucky draws. Run multiple sessions, track winners, and create memorable moments.",
		url: "https://eventzflow.com/services/lucky-draw",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

export default function LuckyDrawPage() {
	return <LuckyDrawPageClient />;
}
