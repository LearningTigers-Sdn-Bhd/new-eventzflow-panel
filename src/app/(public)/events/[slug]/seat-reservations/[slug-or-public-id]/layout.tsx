import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedPublicEvent } from "@/components/pages/seat-ticketing/public/event-data";
import SeatCheckoutSessionBannerProvider from "@/components/pages/seat-ticketing/public/session-page/checkout/seat-checkout-session-banner-provider";
import { SeatReservationSessionProvider } from "@/components/pages/seat-ticketing/public/session-page/seat-reservation-session-provider";
import { getPublicSession } from "@/lib/api/seat-ticketing";

interface LayoutProps {
	params: Promise<{
		slug: string;
		"slug-or-public-id": string;
	}>;
}

export async function generateMetadata({
	params,
}: LayoutProps): Promise<Metadata> {
	const { slug, "slug-or-public-id": sessionId } = await params;
	if (!slug || !sessionId) {
		return {
			title: "Seat Reservations | EventzFlow",
			description: "Seat reservations",
		};
	}
	try {
		const [event, session] = await Promise.all([
			getCachedPublicEvent(slug),
			getPublicSession({ idOrSlugOrPublicId: sessionId }),
		]);
		const title = `${session.name} — ${event.title} Seat Reservations | EventzFlow`;
		return {
			title,
			description: session.location ?? event.description ?? "Seat reservations",
			openGraph: {
				title,
				description:
					session.location ?? event.description ?? "Seat reservations",
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
	params: Promise<{
		slug: string;
		"slug-or-public-id": string;
	}>;
}>) {
	const { slug, "slug-or-public-id": sessionId } = await params;

	// Fetch session once at layout level for prehydration
	let session = null;
	try {
		session = await getPublicSession({ idOrSlugOrPublicId: sessionId });
	} catch {
		notFound();
	}

	return (
		<SeatReservationSessionProvider initialSession={session}>
			<SeatCheckoutSessionBannerProvider
				eventSlug={slug}
				sessionIdentifier={sessionId}
			/>
			{children}
		</SeatReservationSessionProvider>
	);
}
