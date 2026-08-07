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
		<Tabs defaultValue="bookings" className="w-full gap-2">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="bookings">Bookings</TabsTrigger>
				<TabsTrigger value="availability">Availability</TabsTrigger>
			</TabsList>

			<TabsContent value="bookings">
				<BookingsDialog bmEventId={bmEventId} eventId={eventId} />
			</TabsContent>

			<TabsContent value="availability">
				<AvailabilitySlotsPanel bmEventId={bmEventId} eventId={eventId} />
			</TabsContent>
		</Tabs>
	);
}
