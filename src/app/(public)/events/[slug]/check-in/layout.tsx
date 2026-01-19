import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Check-In | EventzFlow",
	description: "Check-in to your event",
};

export default function EventCheckInLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
