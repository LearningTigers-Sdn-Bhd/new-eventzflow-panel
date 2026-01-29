"use client";

import { Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions"; // Import the hook
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import AttachHostDialog from "./attach-host-dialog";
import AvailabilityDialog from "./availability-dialog";
import BookingsDialog from "./bookings-dialog";
import HostDetailsDialog from "./host-details-dialog";

interface BusinessMatchingItemProps {
	event: BusinessMatchingEvent;
}

export function BusinessMatchingItem({ event }: BusinessMatchingItemProps) {
	const { openDialog } = useDialog();
	const { isBusinessHost, canManageEvent } = useEventPermissions(
		event.event_id,
	);
	const host = event.host;

	return (
		<Item variant="outline" className="w-full rounded-none border-dashed">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle>
					<span className="font-bold">{event.title}</span>
				</ItemTitle>

				<div className="grid w-full grid-cols-1 gap-4 text-muted-foreground text-sm md:grid-cols-2">
					{event.location && (
						<div className="flex items-center gap-2">
							<MapPin className="size-4 shrink-0" />
							<span>{event.location}</span>
						</div>
					)}

					{(!!host || canManageEvent) && (
						<div className="mt-1 border-t pt-2 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-4">
							{host ? (
								<div className="flex items-center gap-2">
									<div className="flex flex-1 flex-col">
										<span className="font-medium text-foreground">
											Host: {host.full_name}
										</span>
										<span className="text-xs">
											Phone: {host.phone || "N/A"}
										</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="h-auto shrink-0 px-2 py-1"
										onClick={() => {
											openDialog({
												component: HostDetailsDialog,
												props: {
													host,
													bmEventId: event.id,
													eventId: event.event_id,
												},
												config: {
													title: "Host Details",
													size: "md",
												},
											});
										}}
									>
										<Eye className="size-4" />
									</Button>
								</div>
							) : (
								<Button
									variant="outline"
									size="sm"
									className="w-full rounded-none"
									onClick={() => {
										openDialog({
											component: AttachHostDialog,
											props: { bmEvent: event },
											config: {
												title: `Attach Host to "${event.title}"`,
												size: "lg",
											},
										});
									}}
								>
									Attach a host
								</Button>
							)}
						</div>
					)}
				</div>
			</ItemContent>
			<ItemActions className="mt-4 flex w-full flex-wrap items-center gap-2 sm:mt-0 sm:w-auto">
				{(isBusinessHost || canManageEvent) && (
					<>
						<Button
							variant="outline"
							size="sm"
							className="flex-1 rounded-none sm:flex-initial"
							onClick={() => {
								openDialog({
									component: AvailabilityDialog,
									props: {
										bmEventId: event.id,
										eventId: event.event_id,
										eventTitle: event.title,
									},
									config: {
										title: `Availability for ${event.title}`,
										size: "3xl",
									},
								});
							}}
						>
							View Availability
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1 rounded-none sm:flex-initial"
							onClick={() => {
								openDialog({
									component: BookingsDialog,
									props: {
										bmEventId: event.id,
										eventId: event.event_id,
									},
									config: {
										title: `Bookings for ${event.title}`,
										size: "4xl",
									},
								});
							}}
						>
							View Bookings
						</Button>
					</>
				)}
			</ItemActions>
		</Item>
	);
}
