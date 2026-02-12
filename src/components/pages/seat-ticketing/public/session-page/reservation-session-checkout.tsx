"use client";

import { ShoppingCartIcon, TicketIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGroupColorHex, getSectionShades } from "@/lib/utils/group-colors";
import { AccessibleSeatPicker } from "./components/accessible-seat-picker";
import { CheckoutSeatCard } from "./components/checkout-seat-card";
import {
	usePublicSeatActions,
	usePublicSeatSectionState,
	usePublicSeatSelectedState,
} from "./hooks/use-public-seat-reservation";

export default function ReservationSessionCheckout() {
	const { selectedSeats, totalPrice } = usePublicSeatSelectedState();
	const { sections } = usePublicSeatSectionState();
	const { toggleSeat } = usePublicSeatActions();
	const params = useParams();
	const eventSlug = params.slug as string | undefined;
	const sessionIdentifier = params["slug-or-public-id"] as string | undefined;
	const checkoutHref =
		eventSlug && sessionIdentifier
			? (`/events/${eventSlug}/seat-reservations/${sessionIdentifier}/checkout` as Route)
			: null;

	const selectedSeatsList = Object.values(selectedSeats);
	const isCheckoutDisabled = selectedSeatsList.length === 0;

	return (
		<div className="flex h-full flex-col rounded-none bg-white shadow-2xl">
			<AccessibleSeatPicker />

			<div className="border-b bg-brand-green/5 p-4">
				<h2 className="flex items-center gap-2 font-bold text-lg">
					<TicketIcon className="h-5 w-5 text-brand-green" />
					Selected Seats ({selectedSeatsList.length})
				</h2>
			</div>

			<div className="min-h-0 flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					{selectedSeatsList.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center space-y-3 rounded-none p-6 text-center md:space-y-4 md:p-8">
							<div className="rounded-none bg-slate-100 p-3 md:p-4">
								<ShoppingCartIcon className="h-6 w-6 text-slate-400 md:h-8 md:w-8" />
							</div>
							<h3 className="font-semibold text-slate-600 text-sm md:text-base">
								No seats selected
							</h3>
							<p className="text-slate-400 text-xs md:text-sm">
								Select seats from the canvas or keyboard seat picker.
							</p>
						</div>
					) : (
						<div className="space-y-3 p-4">
							{selectedSeatsList.map((seat) => {
								const section = sections[seat.event_seat_section_id];
								const groupId =
									seat.event_seat_group_assignment?.event_seat_group_id;
								const group = section?.event_seat_groups?.find(
									(item) => item.id === groupId,
								);
								const sectionName = group
									? `${section?.name ?? "Section"} - ${group.name}`
									: section?.name;
								const sectionNameColor = group?.color
									? getGroupColorHex(group.color, 700)
									: getSectionShades(section?.color)[700];
								const priceValue = (
									Number(section?.price || 0) + Number(seat.extra_price || 0)
								).toFixed(2);

								return (
									<CheckoutSeatCard
										key={seat.id}
										sectionName={sectionName}
										sectionNameColor={sectionNameColor}
										seatName={seat.name}
										price={`RM${priceValue}`}
										onRemove={() => void toggleSeat(seat.id)}
										showRemoveButton
									/>
								);
							})}
						</div>
					)}
				</ScrollArea>
			</div>

			<div className="space-y-4 border-t bg-slate-50/50 p-4">
				<div className="flex items-center justify-between">
					<span className="font-bold text-slate-500 text-sm uppercase tracking-wider">
						Total Amount
					</span>
					<span className="font-black text-2xl text-brand-green">
						RM{totalPrice.toFixed(2)}
					</span>
				</div>

				{isCheckoutDisabled ? (
					<Button
						type="button"
						className="h-14 w-full rounded-none bg-brand-green font-bold text-lg uppercase tracking-widest shadow-lg hover:bg-brand-green/90"
						disabled
					>
						Proceed to checkout
					</Button>
				) : checkoutHref ? (
					<Button
						asChild
						className="h-14 w-full rounded-none bg-brand-green font-bold text-lg uppercase tracking-widest shadow-lg transition-all hover:bg-brand-green/90 active:translate-y-0.5"
					>
						<Link href={checkoutHref}>Proceed to checkout</Link>
					</Button>
				) : (
					<Button
						type="button"
						className="h-14 w-full rounded-none bg-brand-green font-bold text-lg uppercase tracking-widest shadow-lg hover:bg-brand-green/90"
						disabled
					>
						Proceed to checkout
					</Button>
				)}
			</div>
		</div>
	);
}
