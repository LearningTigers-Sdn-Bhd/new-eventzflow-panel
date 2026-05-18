import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import EventPrintingServiceClientWrapper from "@/components/pages/event-printing-services/event-printing-service-client-wrapper";

export default async function EventPrintingServicesPage({
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
			<EventPrintingServiceClientWrapper eventId={eventId} />
		</Suspense>
	);
}
