"use client";

import { ListIcon, ShoppingCartIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { getGroupColorHex, getSectionShades } from "@/lib/utils/group-colors";
import {
	AccessibleSeatPicker,
	preloadAccessibleSeatPickerList,
} from "./components/accessible-seat-picker";
import { CheckoutSeatCard } from "./components/checkout-seat-card";
import {
	usePublicSeatActions,
	usePublicSeatSectionState,
	usePublicSeatSelectedState,
} from "./hooks/use-public-seat-reservation";

export default function ReservationSessionMobileBar() {
	const [isSeatListOpen, setIsSeatListOpen] = useState(false);
	const [isCheckoutListOpen, setIsCheckoutListOpen] = useState(false);

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
		<div className="fixed inset-x-0 bottom-0 z-40 border-slate-200 border-t bg-white/95 p-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
			<div className="grid grid-cols-2 gap-2">
				<Sheet open={isSeatListOpen} onOpenChange={setIsSeatListOpen}>
					<SheetTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-9 w-full rounded-none px-3 font-bold text-[10px] uppercase tracking-widest"
							onMouseEnter={preloadAccessibleSeatPickerList}
							onFocus={preloadAccessibleSeatPickerList}
							onPointerDown={preloadAccessibleSeatPickerList}
						>
							<ListIcon className="h-3.5 w-3.5" />
							Seat List
						</Button>
					</SheetTrigger>
					<SheetContent
						side="left"
						className="w-full p-0 sm:max-w-md"
						forceMount
					>
						<SheetHeader className="border-slate-200 border-b">
							<SheetTitle className="font-black text-[12px] uppercase tracking-widest">
								List Of Seats
							</SheetTitle>
							<SheetDescription className="sr-only">
								Browse and select seats from the active section.
							</SheetDescription>
						</SheetHeader>
						<Activity mode={isSeatListOpen ? "visible" : "hidden"}>
							<AccessibleSeatPicker variant="mobile" active={isSeatListOpen} />
						</Activity>
					</SheetContent>
				</Sheet>

				<Sheet open={isCheckoutListOpen} onOpenChange={setIsCheckoutListOpen}>
					<SheetTrigger asChild>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-9 w-full rounded-none px-3 font-bold text-[10px] uppercase tracking-widest"
						>
							<ShoppingCartIcon className="h-3.5 w-3.5" />
							Items ({selectedSeatsList.length})
						</Button>
					</SheetTrigger>
					<SheetContent
						side="right"
						className="flex w-full flex-col p-0 sm:max-w-md"
						forceMount
					>
						<SheetHeader className="border-slate-200 border-b">
							<SheetTitle className="font-black text-[12px] uppercase tracking-widest">
								Checkout Items
							</SheetTitle>
							<SheetDescription className="sr-only">
								Review selected seats in your checkout list.
							</SheetDescription>
						</SheetHeader>
						<Activity mode={isCheckoutListOpen ? "visible" : "hidden"}>
							<ScrollArea className="h-full">
								{selectedSeatsList.length === 0 ? (
									<div className="p-4 text-slate-500 text-sm">
										No seats selected.
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
												Number(section?.price || 0) +
												Number(seat.extra_price || 0)
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
						</Activity>
					</SheetContent>
				</Sheet>
			</div>

			<div className="mt-2 flex items-center justify-between gap-3">
				<p className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
					Total Amount
				</p>
				<p className="truncate font-black text-2xl text-brand-green">
					RM{totalPrice.toFixed(2)}
				</p>
			</div>

			{isCheckoutDisabled ? (
				<Button
					type="button"
					disabled
					className="mt-2 h-12 w-full rounded-none bg-brand-green font-bold text-sm uppercase tracking-widest"
				>
					Proceed checkout
				</Button>
			) : checkoutHref ? (
				<Button
					asChild
					className="mt-2 h-12 w-full rounded-none bg-brand-green font-bold text-sm uppercase tracking-widest"
				>
					<Link href={checkoutHref}>Proceed checkout</Link>
				</Button>
			) : (
				<Button
					type="button"
					disabled
					className="mt-2 h-12 w-full rounded-none bg-brand-green font-bold text-sm uppercase tracking-widest"
				>
					Proceed checkout
				</Button>
			)}
		</div>
	);
}
