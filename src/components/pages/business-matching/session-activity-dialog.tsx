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
	return (
		<Tabs
			defaultValue="bookings"
			className="flex h-full min-h-0 w-full flex-col gap-2"
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
