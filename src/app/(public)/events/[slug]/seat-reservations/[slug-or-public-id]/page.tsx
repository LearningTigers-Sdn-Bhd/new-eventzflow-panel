import { getPublicEventById } from "@/lib/api/event/endpoints";
import SeatReservationSessionClient from "@/components/pages/seat-ticketing/public/session-page/seat-reservation-session-client";

interface PageProps {
	params: Promise<{
		slug: string;
		"slug-or-public-id": string;
	}>;
}

export default async function SeatReservationSessionPage({ params }: PageProps) {
	const { slug } = await params;

	const event = await getPublicEventById(slug);

	return (
		<SeatReservationSessionClient
			initialEvent={event}
			eventSlug={slug}
		/>
	);
}