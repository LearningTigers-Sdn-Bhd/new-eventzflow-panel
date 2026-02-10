"use client";

import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import SeatReservationSeatsCanvas from "./seat-reservation-seats-canvas";
import SeatReservationSessionCheckout from "./seat-reservation-session-checkout";
import SeatReservationSessionHeader from "./seat-reservation-session-header";

interface SeatReservationSessionWrapperProps {
	session: EventSeatSession;
	eventTitle?: string | null;
	eventSlug: string | null;
}

export default function SeatReservationSessionWrapper({
	session,
	eventTitle,
	eventSlug,
}: SeatReservationSessionWrapperProps) {
	return (
		<div className="min-h-screen bg-slate-50">
			<main className="grid h-screen w-full grid-cols-1 lg:grid-cols-5">
				<section className="flex h-screen flex-col border-r bg-white lg:col-span-2">
					<SeatReservationSessionHeader
						session={session}
						eventTitle={eventTitle}
						eventSlug={eventSlug}
					/>
					<div className="flex-1 overflow-y-auto">
						<SeatReservationSessionCheckout />
					</div>
				</section>
				<section className="relative h-screen bg-slate-100 lg:col-span-3">
					<SeatReservationSeatsCanvas />
				</section>
			</main>
		</div>
	);
}
