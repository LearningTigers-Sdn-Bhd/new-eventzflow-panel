"use client";

import { ShoppingCartIcon, TicketIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import SeatReservationSeatCard from "./seat-reservation-seat-card";
import { useSeatReservation } from "./seat-reservation-session-provider";

export default function SeatReservationSessionCheckout() {
	const { selectedSeats, totalPrice, session, toggleSeat } =
		useSeatReservation();
	const params = useParams();
	const eventSlug = params.slug as string | undefined;
	const sessionIdentifier = params["slug-or-public-id"] as string | undefined;
	const checkoutHref =
		eventSlug && sessionIdentifier
			? (`/events/${eventSlug}/seat-reservations/${sessionIdentifier}/checkout` as Route)
			: null;

	const seatSections = session?.event_seat_venues
		?.flatMap((venue) =>
			(venue.event_seat_sections ?? []).map((section) => ({
				venueId: venue.id,
				section,
			})),
		)
		.filter(Boolean);

	if (selectedSeats.size === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center space-y-3 p-6 text-center rounded-none md:space-y-4 md:p-8">
				<div className="bg-slate-100 p-3 rounded-none md:p-4">
					<ShoppingCartIcon className="h-6 w-6 text-slate-400 md:h-8 md:w-8" />
				</div>
				<h3 className="text-sm font-semibold text-slate-600 md:text-base">
					No seats selected
				</h3>
				<p className="text-xs text-slate-400 md:text-sm">
					Please click on the seats you'd like to reserve on the canvas.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-white shadow-2xl lg:border-l rounded-none">
			<div className="bg-brand-green/5 p-3 rounded-none md:p-4">
				<h2 className="flex items-center gap-2 text-lg font-bold md:text-xl">
					<TicketIcon className="h-4 w-4 text-brand-green md:h-5 md:w-5" />
					Selected Seats ({selectedSeats.size})
				</h2>
			</div>

			<div className="flex h-full flex-col justify-between p-3 rounded-none">
				<div className="space-y-2">
					<ScrollArea className="h-[250px]">
						<div className="space-y-3 rounded-none pr-3">
							{Array.from(selectedSeats.values()).map((seat) => {
								const sectionMeta = seatSections?.find(
									(item) => item.section.id === seat.event_seat_section_id,
								);
								const section = sectionMeta?.section;
								const priceValue = (
									Number(section?.price || 0) + Number(seat.extra_price || 0)
								).toFixed(2);

								return (
									<SeatReservationSeatCard
										key={seat.id}
										sectionName={section?.name}
										seatName={seat.name}
										price={`RM${priceValue}`}
										onRemove={() => {
											if (!sectionMeta) return;
											void toggleSeat(
												sectionMeta.venueId,
												sectionMeta.section.id,
												seat,
											);
										}}
									/>
								);
							})}
						</div>
					</ScrollArea>
				</div>

				<div className="space-y-2 mb-3">
					<div className="mb-3 flex items-center justify-between">
						<span className="text-sm font-medium text-slate-500 md:text-base">
							Total Amount
						</span>
						<span className="text-xl font-black text-brand-green md:text-2xl">
							RM{totalPrice.toFixed(2)}
						</span>
					</div>
					{checkoutHref ? (
						<Button
							asChild
							className="h-12 w-full rounded-none bg-brand-green text-base font-bold hover:bg-brand-green/90 md:h-14 md:text-lg"
							disabled={selectedSeats.size === 0}
						>
							<Link href={checkoutHref}>Proceed to checkout</Link>
						</Button>
					) : (
						<Button
							type="button"
							className="h-12 w-full rounded-none bg-brand-green text-base font-bold hover:bg-brand-green/90 md:h-14 md:text-lg"
							disabled
						>
							Proceed to checkout
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
