"use client";

import { MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions"; // Import the hook
import type { BusinessMatchingEvent, BusinessHost } from "@/lib/api/business-matching";
import AvailabilityDialog from "./availability-dialog";
import BookingsDialog from "./bookings-dialog";
import AttachHostDialog from "./attach-host-dialog";
import HostDetailsDialog from "./host-details-dialog";

interface BusinessMatchingItemProps {
	event: BusinessMatchingEvent;
}

export function BusinessMatchingItem({ event }: BusinessMatchingItemProps) {
    const { openDialog } = useDialog();
    const { isBusinessHost, canManageEvent } = useEventPermissions(event.event_id);
    const host = event.host;

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle>
					<span className="font-bold">{event.title}</span>
				</ItemTitle>
                
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-muted-foreground text-sm">
                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="size-4 shrink-0" />
                            <span>{event.location}</span>
                        </div>
                    )}
                    
                    {(!isBusinessHost || canManageEvent) && (
                        <div className="md:border-l md:pl-4 md:border-t-0 border-t pt-2 md:pt-0 mt-1 md:mt-0">
                            {host ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col flex-1">
                                        <span className="text-foreground font-medium">Host: {host.full_name}</span>
                                        <span className="text-xs">Phone: {host.phone || "N/A"}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0 h-auto py-1 px-2"
                                        onClick={() => {
                                            openDialog({
                                                component: HostDetailsDialog,
                                                props: { 
                                                    host, 
                                                    bmEventId: event.id, 
                                                    eventId: event.event_id 
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
                                    className="w-full"
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
			<ItemActions className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                    onClick={() => {
                        openDialog({
                            component: AvailabilityDialog,
                            props: {
                                bmEventId: event.id,
                                eventId: event.event_id,
                                eventTitle: event.title
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
                    className="flex-1 sm:flex-initial"
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
			</ItemActions>
		</Item>
	);
}
