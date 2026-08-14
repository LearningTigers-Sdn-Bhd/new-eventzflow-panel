"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvailabilitySlotsPanel from "./availability-slots-panel";
import BookingsDialog from "./bookings-dialog";

interface SessionActivityDialogProps {
	bmEventId: string;
	eventId: string;
}

export default function SessionActivityDialog({
	bmEventId,
	eventId,
}: SessionActivityDialogProps) {
	// The desktop dialog is only *max*-height constrained, so `h-full` here
	// resolved to auto — the tab panel then clipped its overflow instead of
	// letting the inner ScrollArea scroll (bookings past the 3rd were
	// unreachable). A definite height gives the whole chain something to
	// resolve against. Mobile already gets one from the full-screen dialog.
	return (
		<Tabs
			defaultValue="bookings"
			className="flex h-full min-h-0 w-full flex-col gap-2 md:h-[70vh]"
		>
			<TabsList className="grid w-full shrink-0 grid-cols-2">
				<TabsTrigger value="bookings">Bookings</TabsTrigger>
				<TabsTrigger value="availability">Availability</TabsTrigger>
			</TabsList>

			<TabsContent value="bookings" className="min-h-0 flex-1 overflow-hidden">
				<BookingsDialog bmEventId={bmEventId} eventId={eventId} />
			</TabsContent>

			<TabsContent
				value="availability"
				className="min-h-0 flex-1 overflow-y-auto"
			>
				<AvailabilitySlotsPanel bmEventId={bmEventId} eventId={eventId} />
			</TabsContent>
		</Tabs>
	);
}
