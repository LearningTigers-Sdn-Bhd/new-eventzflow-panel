"use client";

import { CalendarCheck, MapPin, Pencil, User } from "lucide-react";
import { useMemo } from "react";
import { ExpandableTags } from "@/components/admin-ui/expandable-tags";
import { Button } from "@/components/ui/button";
import { Item, ItemContent } from "@/components/ui/item";
import { useAuth } from "@/hooks/auth/use-auth";
import { useBusinessMatchingBookings } from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions"; // Import the hook
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import AttachHostDialog from "./attach-host-dialog";
import CreateSessionDialog from "./create-session-dialog";
import HostDetailsDialog from "./host-details-dialog";
import SessionActivityDialog from "./session-activity-dialog";

interface BusinessMatchingItemProps {
	event: BusinessMatchingEvent;
}

export function BusinessMatchingItem({ event }: BusinessMatchingItemProps) {
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const { isBusinessHost, canManageEvent } = useEventPermissions(
		event.event_id,
	);
	const host = event.host;
	const offeringTags = event.offering_tags || [];
	const ownsSession =
		isBusinessHost && !!user && String(host?.id ?? "") === String(user.id);

	const { data: bookingsData } = useBusinessMatchingBookings(
		event.id,
		event.event_id,
	);

	// Soonest booking that hasn't happened yet, if any — blank otherwise.
	const upcomingBooking = useMemo(() => {
		const bookings = bookingsData?.bookings;
		if (!bookings?.length) return null;

		const now = new Date();
		const year = now.getFullYear();

		return bookings
			.map((b) => {
				const dateTimeString = `${b.booking_date} ${year} ${b.booking_time}`;
				const parsableString = dateTimeString.replace(/ (AM|PM)$/, "M");
				return { booking: b, date: new Date(parsableString) };
			})
			.filter((x) => !Number.isNaN(x.date.getTime()) && x.date >= now)
			.sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.booking;
	}, [bookingsData]);

	return (
		<Item
			variant="outline"
			onClick={() => {
				openDialog({
					component: SessionActivityDialog,
					props: {
						bmEventId: event.id,
						eventId: event.event_id,
					},
					config: {
						title: `Bookings & Availability for ${event.title}`,
						size: "5xl",
					},
				});
			}}
			className="w-full cursor-pointer space-y-2 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-md"
		>
			<ItemContent className="flex w-full flex-col gap-2">
				<div className="flex items-start justify-between gap-2">
					<span className="block min-w-0 flex-1 break-words font-semibold text-foreground text-sm leading-snug">
						{event.title}
					</span>
					{(canManageEvent || ownsSession) && (
						<Button
							variant="outline"
							size="icon"
							onClick={(e) => {
								e.stopPropagation();
								openDialog({
									component: CreateSessionDialog,
									props: {
										eventId: event.event_id,
										session: event,
										isHostEditing: !canManageEvent,
									},
									config: {
										title: `Edit "${event.title}"`,
										size: "2xl",
									},
								});
							}}
							className="h-8 w-8 shrink-0"
							title="Edit"
						>
							<Pencil className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Tags */}
				<ExpandableTags
					tags={offeringTags}
					limit={2}
					singleRow
					className="mt-0.5"
				/>

				<div className="space-y-1 border-muted-foreground/10 border-t pt-2">
					{host ? (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
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
							className="flex w-full items-center gap-1.5 truncate text-left font-medium text-foreground text-sm transition-colors hover:text-primary hover:underline"
						>
							<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							{host.full_name}
						</button>
					) : (
						<Button
							variant="outline"
							size="sm"
							disabled={isBusinessHost && !canManageEvent}
							onClick={(e) => {
								e.stopPropagation();
								openDialog({
									component: AttachHostDialog,
									props: { bmEvent: event },
									config: {
										title: `Attach Host to "${event.title}"`,
										size: "lg",
									},
								});
							}}
							className="h-8 w-full justify-center text-xs"
						>
							Attach a host
						</Button>
					)}
					{event.location && (
						<span className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<MapPin className="h-3.5 w-3.5 shrink-0" />
							{event.location}
						</span>
					)}
				</div>

				{upcomingBooking && (
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<CalendarCheck className="h-3.5 w-3.5 shrink-0" />
						<span>
							Next: {upcomingBooking.booking_date} at{" "}
							{upcomingBooking.booking_time}
						</span>
					</div>
				)}
			</ItemContent>
		</Item>
	);
}
