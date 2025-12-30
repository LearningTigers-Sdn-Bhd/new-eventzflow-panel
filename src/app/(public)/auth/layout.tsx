import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "EventzFlow - Get Started",
	description:
		"Sign in to continue or create your account now to access all features of event management.",
	applicationName: "EventzFlow",
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
	openGraph: {
		title: "EventzFlow - Get Started",
		description:
			"Sign in to continue or create your account now to access all features of event management.",
		url: "https://eventzflow.com",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/api/og?title=Get Started&subtitle=Login or Signup to EventzFlow Panel to manage your events",
				width: 1200,
				height: 630,
				alt: "EventzFlow",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "EventzFlow - Authentication",
		description:
			"Sign in to continue or create your account now to access all features of event management.",
		images: [
			"/api/og?title=Get Started&subtitle=Login or Signup to EventzFlow Panel to manage your events",
		],
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
