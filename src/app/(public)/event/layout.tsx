import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "EventzFlow - Events",
	description:
		"The collection of the events created and managed with EventzFlow.",
	applicationName: "EventzFlow",
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
};

export default function EventLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
