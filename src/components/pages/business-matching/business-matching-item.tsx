"use client";

import {
	Clock,
	MapPin,
	Mail,
	MessageSquare,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemTitle,
} from "@/components/ui/item";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import AvailabilityDialog from "./availability-dialog";
import BookingsDialog from "./bookings-dialog";

interface BusinessMatchingItemProps {
	event: BusinessMatchingEvent;
}

export function BusinessMatchingItem({ event }: BusinessMatchingItemProps) {
    const { openDialog } = useDialog();

    const handleEmailClick = () => {
		window.location.href = `mailto:${event.admin_email}`;
	};

	const handleWhatsAppClick = () => {
		if (event.admin_wa_number) {
			window.open(
				`https://wa.me/${event.admin_wa_number.replace(/[^0-9]/g, "")}`,
				"_blank",
			);
		}
	};

	return (
		<Item variant="outline" className="w-full rounded-none">
			<ItemContent className="flex flex-col gap-3">
				<ItemTitle>
					<span className="font-bold">{event.title}</span>
				</ItemTitle>
                
				<div className="flex w-full flex-col text-muted-foreground text-sm gap-1">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>{event.duration} mins</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="size-4" />
                            <a
                                href={event.location}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                            >
                                Location Link <ExternalLink className="size-3" />
                            </a>
                        </div>
                    )}
                    <div className="group flex w-full items-center gap-0.5">
						<Mail className="size-4" />
						<Button
							variant="ghost"
							size="sm"
							className="rounded-none hover:bg-transparent h-auto py-0 px-2"
							onClick={handleEmailClick}
						>
							<span className="text-sm group-hover:underline">
								{event.admin_email}
							</span>
						</Button>
					</div>
                    {event.admin_wa_number && (
                        <div className="group flex w-full items-center gap-0.5">
                            <MessageSquare className="size-4" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-none hover:bg-transparent h-auto py-0 px-2"
                                onClick={handleWhatsAppClick}
                            >
                                <span className="text-sm group-hover:underline">
                                    {event.admin_wa_number}
                                </span>
                            </Button>
                        </div>
                    )}
				</div>
			</ItemContent>
			<ItemActions className="flex-col gap-2 sm:flex-row w-full mt-2 sm:mt-0 sm:w-auto">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                        openDialog({
                            component: AvailabilityDialog,
                            props: {
                                bmEventId: event.id,
                                eventId: event.event_id,
                                eventTitle: event.title
                            },
                            config: {
                                title: `${event.title}`,
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
                    className="w-full"
                    onClick={() => {
                        openDialog({
                            component: BookingsDialog,
                            props: {
                                bmEventId: event.id,
                                eventId: event.event_id,
                            },
                            config: {
                                title: `Bookings for ${event.title}`,
                                size: "3xl",
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
