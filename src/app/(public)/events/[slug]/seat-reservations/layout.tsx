import type { Metadata } from "next";
import { getCachedPublicEvent } from "@/components/pages/seat-ticketing/public/event-data";
import { EventSeatReservationsProvider } from "@/components/pages/seat-ticketing/public/event-seat-reservations-provider";

interface LayoutProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata> {
	const { slug } = await params;
	if (!slug) {
		return {
			title: "Seat Reservations | EventzFlow",
			description: "Seat reservations",
		};
	}
	try {
		const event = await getCachedPublicEvent(slug);
		const title = `${event.title} Seat Reservations | EventzFlow`;
		return {
			title,
			description: event.description ?? "Seat reservations",
			openGraph: {
				title,
				description: event.description ?? "Seat reservations",
			},
		};
	} catch {
		return {
			title: "Seat Reservations | EventzFlow",
			description: "Seat reservations",
		};
	}
}

export default async function EventSeatReservationsLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ slug: string }>;
}>) {
	const { slug } = await params;
	let publicEvent = null;

	if (slug) {
		try {
			publicEvent = await getCachedPublicEvent(slug);
		} catch {
			publicEvent = null;
		}
	}

	return (
		<EventSeatReservationsProvider
			publicEvent={publicEvent}
			eventSlug={slug ?? null}
		>
			{children}
		</EventSeatReservationsProvider>
	);
}
