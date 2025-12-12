import { RiCalendarEventFill } from "react-icons/ri";
import { IconTitle } from "@/components/ui/icon-heading";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@/lib/api/event";

interface EventHeaderProps {
	event: Event | undefined;
	eventId: string;
	isLoading: boolean;
}

export function EventHeader({ event, eventId, isLoading }: EventHeaderProps) {
	if (isLoading) {
		return (
			<div className="border-b border-dashed">
				<div className="page-header">
					<div className="px-2 md:px-4">
						<Skeleton className="mb-2 h-9 w-64" />
						<Skeleton className="h-5 w-96" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="border-b border-dashed">
			<div className="page-header">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={RiCalendarEventFill}
						title={event?.title || `Event ${eventId}`}
						description="Manage and view details for this event"
					/>
				</div>
				{event?.status && (
					<div className="px-2 md:px-4">
						<Badge
							variant={event.status === "published" ? "default" : "secondary"}
							className="rounded-none"
						>
							{event.status === "published" ? "Published" : "Draft"}
						</Badge>
					</div>
				)}
			</div>
		</div>
	);
}
