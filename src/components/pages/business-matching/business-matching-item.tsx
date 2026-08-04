"use client";

import { format, parseISO } from "date-fns";
import {
	Calendar,
	CalendarCheck,
	Clock,
	MapPin,
	Pencil,
	User,
} from "lucide-react";
import { ExpandableTags } from "@/components/admin-ui/expandable-tags";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent } from "@/components/ui/item";
import { useAuth } from "@/hooks/auth/use-auth";
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
	const count = event.bookings_count ?? 0;
	const ownsSession = isBusinessHost && !!user && host?.id === String(user.id);

	return (
		<Item
			variant="outline"
			className="w-full space-y-3.5 rounded-lg border border-muted bg-card p-4 transition-all duration-200 hover:shadow-md"
		>
			<ItemContent className="flex w-full flex-col gap-2.5">
				<div>
					<span
						className={`block break-words font-semibold text-foreground leading-snug ${
							event.title.length > 40 ? "text-sm sm:text-base" : "text-base"
						}`}
					>
						{event.title}
					</span>
					{event.location && (
						<span className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground text-xs">
							<MapPin className="h-3.5 w-3.5 shrink-0" />
							{event.location}
						</span>
					)}
				</div>

				{/* Tags */}
				<ExpandableTags tags={offeringTags} limit={5} className="mt-0.5" />

				<div className="grid grid-cols-1 gap-3 border-muted-foreground/10 border-t pt-3 sm:grid-cols-2">
					{/* Host info */}
					<div className="space-y-1.5">
						<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							Host Profile
						</span>
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
								className="h-8 w-full justify-center text-xs"
							>
								Attach a host
							</Button>
						)}
					</div>

					{/* Activity & Stats */}
					<div className="space-y-1.5 border-muted-foreground/10 sm:border-l sm:pl-3">
						<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
							Activity & Stats
						</span>
						<div className="space-y-1 text-xs">
							<div>
								<button
									type="button"
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
									className={`inline-flex h-5 cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold text-[10px] shadow-sm transition-all hover:shadow-md ${
										count > 0
											? "bg-primary text-primary-foreground hover:opacity-90"
											: "border border-muted-foreground/30 border-dashed bg-transparent text-muted-foreground hover:bg-muted/50"
									}`}
								>
									{count > 0 && <CalendarCheck className="h-2.5 w-2.5" />}
									{count} booking{count !== 1 ? "s" : ""}
								</button>
							</div>
							{event.created_at && (
								<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
									<Calendar className="h-3 w-3 shrink-0" />
									<span>
										Created: {format(parseISO(event.created_at), "dd MMM yyyy")}
									</span>
								</div>
							)}
							{event.updated_at && (
								<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
									<Clock className="h-3 w-3 shrink-0" />
									<span>
										Updated:{" "}
										{format(parseISO(event.updated_at), "dd MMM yyyy, h:mm a")}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</ItemContent>
			<ItemActions className="mt-4 flex w-full items-center gap-2 sm:mt-0 sm:w-auto">
				{(canManageEvent || ownsSession) && (
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
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
							className="h-8 w-8"
							title="Edit"
						>
							<Pencil className="h-4 w-4" />
						</Button>
					</div>
				)}
			</ItemActions>
		</Item>
	);
}
