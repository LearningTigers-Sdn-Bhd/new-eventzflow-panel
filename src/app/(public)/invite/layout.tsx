import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "EventzFlow - Inviting Users",
	description: "Invite an individual to manage the event via EventzFlow panel.",
	applicationName: "EventzFlow",
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
};

export default function InviteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
