import type { Metadata } from "next";
import { getCachedPublicEvent } from "@/components/pages/seat-ticketing/public/event-data";
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

export default function EventSeatReservationsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
