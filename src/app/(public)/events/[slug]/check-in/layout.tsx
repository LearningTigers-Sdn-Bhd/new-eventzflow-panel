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
	return (
		<div className="min-h-screen w-full bg-white">
			<div className="mx-auto max-w-lg px-6 py-12 sm:py-16">
				{children}
			</div>
		</div>
	);
}
