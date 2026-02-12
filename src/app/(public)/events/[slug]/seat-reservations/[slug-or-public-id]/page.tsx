import ReservationSessionClient from "@/components/pages/seat-ticketing/public/session-page/reservation-session-client";
import { getPublicEventById } from "@/lib/api/event/endpoints";

interface PageProps {
	params: Promise<{
		slug: string;
		"slug-or-public-id": string;
	}>;
}

export default async function SeatReservationSessionPage({
	params,
}: PageProps) {
	const { slug } = await params;

	const event = await getPublicEventById(slug);

	return <ReservationSessionClient initialEvent={event} eventSlug={slug} />;
}
