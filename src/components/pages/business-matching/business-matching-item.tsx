"use client";

import { Calendar, Clock, MapPin, Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
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
import CreateSessionDialog from "./create-session-dialog";

interface BusinessMatchingItemProps {
	event: BusinessMatchingEvent;
}

export function BusinessMatchingItem({ event }: BusinessMatchingItemProps) {
	const { openDialog } = useDialog();
	const { isBusinessHost, canManageEvent } = useEventPermissions(
		event.event_id,
	);
	const host = event.host;
	const offeringTags = event.offering_tags || [];
	const count = event.bookings_count ?? 0;

	return (
		<Item variant="outline" className="w-full rounded-lg border border-muted p-4 space-y-3.5 bg-card hover:shadow-md transition-all duration-200">
			<ItemContent className="flex flex-col gap-2.5 w-full">
				<div>
					<span className={`font-semibold text-foreground leading-snug block break-words ${
						event.title.length > 40 ? "text-sm sm:text-base" : "text-base"
					}`}>
						{event.title}
					</span>
					{event.location && (
						<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
							<MapPin className="h-3.5 w-3.5 shrink-0" />
							{event.location}
						</span>
					)}
				</div>

				{/* Tags */}
				{offeringTags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-0.5">
						{offeringTags.map((tag) => (
							<span
								key={tag}
								className="inline-flex items-center rounded bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-primary border border-primary/10"
							>
								{tag}
							</span>
						))}
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-muted-foreground/10">
					{/* Host info */}
					<div className="space-y-1.5">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider block">Host Profile</span>
						{host ? (
							<button
								type="button"
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
								className="font-medium text-sm text-foreground hover:text-primary hover:underline flex items-center gap-1.5 transition-colors text-left truncate w-full"
							>
								<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								{host.full_name}
							</button>
						) : (
							<Button
								variant="outline"
								size="sm"
								disabled={isBusinessHost && !canManageEvent}
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
								className="h-8 text-xs w-full justify-center"
							>
								Attach a host
							</Button>
						)}
					</div>

					{/* Activity & Stats */}
					<div className="space-y-1.5 sm:border-l sm:pl-3 border-muted-foreground/10">
						<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider block">Activity & Stats</span>
						<div className="space-y-1 text-xs">
							<div>
								<button
									type="button"
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
									className="inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary transition-colors border border-primary/20 cursor-pointer h-5"
								>
									{count} booking{count !== 1 ? "s" : ""}
								</button>
							</div>
							{event.created_at && (
								<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
									<Calendar className="h-3 w-3 shrink-0" />
									<span>Created: {format(parseISO(event.created_at), "dd MMM yyyy")}</span>
								</div>
							)}
							{event.updated_at && (
								<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
									<Clock className="h-3 w-3 shrink-0" />
									<span>Updated: {format(parseISO(event.updated_at), "dd MMM yyyy, h:mm a")}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</ItemContent>
			<ItemActions className="mt-4 flex w-full items-center gap-2 sm:mt-0 sm:w-auto">
				{(isBusinessHost || canManageEvent) && (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
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
							className="h-8 w-8"
							title="Availability"
						>
							<Calendar className="h-4 w-4" />
						</Button>
						{canManageEvent && (
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									openDialog({
										component: CreateSessionDialog,
										props: {
											eventId: event.event_id,
											session: event,
										},
										config: {
											title: `Edit "${event.title}"`,
											size: "lg",
										},
									});
								}}
								className="h-8 w-8"
								title="Edit"
							>
								<Pencil className="h-4 w-4" />
							</Button>
						)}
					</div>
				)}
			</ItemActions>
		</Item>
	);
}
