import ReservationCheckoutClient from "@/components/pages/seat-ticketing/public/reservation-checkout/reservation-checkout-client";
import { getPublicEventById } from "@/lib/api/event/endpoints";

interface PageProps {
	params: Promise<{
		slug: string;
		"slug-or-public-id": string;
	}>;
}

export default async function SeatReservationCheckoutRoute({
	params,
}: PageProps) {
	const { slug } = await params;
	const event = await getPublicEventById(slug);

	return <ReservationCheckoutClient initialEvent={event} eventSlug={slug} />;
}
