import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import EventRentableItemClientWrapper from "@/components/pages/event-rentable-items/event-rentable-item-client-wrapper";

export default async function EventRentableItemsPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = await params;
	const eventId = Number.parseInt(event_id);

	return (
		<Suspense
			fallback={
				<div className="flex h-[50vh] items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}
		>
			<EventRentableItemClientWrapper eventId={eventId} />
		</Suspense>
	);
}
