"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import AvailabilitySlotsPanel from "./availability-slots-panel";
import BookingsDialog from "./bookings-dialog";
import { BuyerBookingsList } from "./buyer-bookings-section";

interface SessionActivityDialogProps {
	bmEventId: string;
	eventId: string;
	// Set for staff: the session's seller, whose bookings with other sellers
	// (as a buyer) get their own tab.
	sellerUserId?: string;
}

export default function SessionActivityDialog({
	bmEventId,
	eventId,
	sellerUserId,
}: SessionActivityDialogProps) {
	const { closeDialog } = useDialog();

	// The desktop dialog is only *max*-height constrained, so `h-full` here
	// resolved to auto — the tab panel then clipped its overflow instead of
	// letting the inner ScrollArea scroll (bookings past the 3rd were
	// unreachable). A definite height gives the whole chain something to
	// resolve against. Mobile already gets one from the full-screen dialog.
	return (
		<div className="flex h-full min-h-0 w-full flex-col px-4 pb-4 md:px-6 md:pb-6">
			<Tabs
				defaultValue="bookings"
				className="flex h-full min-h-0 w-full flex-1 flex-col gap-3"
			>
				<TabsList
					className={cn(
						"grid w-full shrink-0 rounded-none",
						sellerUserId ? "grid-cols-3" : "grid-cols-2",
					)}
				>
					<TabsTrigger value="bookings" className="rounded-none">
						Bookings
					</TabsTrigger>
					<TabsTrigger value="availability" className="rounded-none">
						Availability
					</TabsTrigger>
					{sellerUserId && (
						<TabsTrigger value="as-buyer" className="rounded-none">
							As Buyer
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent
					value="bookings"
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
				>
					<BookingsDialog bmEventId={bmEventId} eventId={eventId} />
				</TabsContent>

				<TabsContent
					value="availability"
					className="min-h-0 flex-1 overflow-y-auto"
				>
					<AvailabilitySlotsPanel bmEventId={bmEventId} eventId={eventId} />
				</TabsContent>

				{sellerUserId && (
					<TabsContent
						value="as-buyer"
						className="min-h-0 flex-1 space-y-2 overflow-y-auto px-1"
					>
						<p className="text-muted-foreground text-sm">
							Meetings this seller booked with other sellers.
						</p>
						<BuyerBookingsList
							eventId={eventId}
							hostUserId={sellerUserId}
							emptyText="This seller hasn't booked any meetings with other sellers."
						/>
					</TabsContent>
				)}
			</Tabs>

			{/* Bottom bar with Cancel/Close button for mobile view */}
			<div className="-mx-4 flex shrink-0 justify-end border-t bg-background/95 px-4 py-2.5 backdrop-blur-sm md:hidden">
				<Button type="button" variant="outline" size="sm" onClick={closeDialog}>
					Close
				</Button>
			</div>
		</div>
	);
}
