"use client";

import type { PublicEventInfo } from "@/lib/api/event/endpoints";
import { usePublicSeatReservation } from "../session-page/hooks/use-public-seat-reservation";
import CheckoutActions from "./checkout-actions";
import ReservationCheckoutHeader from "./reservation-checkout-header";
import SeatSummary from "./seat-summary";

export default function ReservationCheckoutPage({
	event,
}: {
	event: PublicEventInfo | null;
}) {
	const { selectedSeats, sections, totalPrice } = usePublicSeatReservation();

	const selectedSeatsList = Object.values(selectedSeats);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<ReservationCheckoutHeader eventTitle={event?.title ?? null} />

			<main className="flex flex-1 flex-col lg:flex-row">
				{/* Left Side: Seat Summary */}
				<div className="flex-1 py-8 lg:border-r lg:py-12">
					<div className="mx-auto h-full w-full">
						<SeatSummary
							seats={selectedSeatsList}
							sections={sections}
							totalPrice={totalPrice}
						/>
					</div>
				</div>

				{/* Right Side: Checkout Actions */}
				<div className="flex w-full flex-col bg-slate-50/50 py-8 lg:w-[450px] lg:py-12 xl:w-[550px]">
					<div className="flex h-full flex-col">
						<CheckoutActions totalPrice={totalPrice} />
					</div>
				</div>
			</main>
		</div>
	);
}
