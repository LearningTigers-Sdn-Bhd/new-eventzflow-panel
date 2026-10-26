"use client";

import {
	Archive,
	ArchiveRestore,
	CalendarCheck,
	MapPin,
	Pencil,
	User,
} from "lucide-react";
import { useMemo } from "react";
import { ExpandableTags } from "@/components/admin-ui/expandable-tags";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Item, ItemContent } from "@/components/ui/item";
import { useAuth } from "@/hooks/auth/use-auth";
import { useBusinessMatchingBookings } from "@/hooks/use-business-matching";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import ArchiveSessionDialog, {
	RestoreSessionDialog,
} from "./archive-session-dialog";
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
	const { permissions } = useEventSidebarContext();
	const { isBusinessHost, canManageEvent, isBusinessMatchingAdmin } =
		permissions;
	const canManageSession = canManageEvent || isBusinessMatchingAdmin;
	const host = event.host;
	const offeringTags = event.offering_tags || [];
	const ownsSession =
		isBusinessHost && !!user && String(host?.id ?? "") === String(user.id);
	const isArchived = event.is_archived ?? !!event.archived_at;
	const hasHost = !!host;
	const bookingsCount = event.bookings_count ?? 0;
	const canArchive = !hasHost && bookingsCount === 0;

	const handleArchive = (e: React.MouseEvent) => {
		e.stopPropagation();
		openDialog({
			component: ArchiveSessionDialog,
			props: { session: event },
			config: {
				title: canArchive ? "Archive Session" : "Cannot Archive Session",
				size: "md",
				className: "rounded-none",
			},
		});
	};

	const handleUnarchive = (e: React.MouseEvent) => {
		e.stopPropagation();
		openDialog({
			component: RestoreSessionDialog,
			props: { session: event },
			config: {
				title: "Restore Session",
				size: "md",
				className: "rounded-none",
			},
		});
	};

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
						sellerUserId: canManageSession ? host?.id : undefined,
					},
					config: {
						title: `Bookings & Availability for ${event.title}`,
						size: "full",
					},
				});
			}}
			className="w-full cursor-pointer space-y-2 rounded-none border border-border bg-card p-3 transition-all duration-200 hover:shadow-md"
		>
			<ItemContent className="flex w-full flex-col gap-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
						<span className="break-words font-semibold text-foreground text-sm leading-snug">
							{event.title}
						</span>
						{isArchived && (
							<span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-[10px] text-amber-700 dark:text-amber-400">
								Archived
							</span>
						)}
					</div>
					<ButtonGroup className="shrink-0">
						{(canManageSession || ownsSession) && !isArchived && (
							<Button
								variant="outline"
								size="icon-sm"
								onClick={(e) => {
									e.stopPropagation();
									openDialog({
										component: CreateSessionDialog,
										props: {
											eventId: event.event_id,
											session: event,
											isHostEditing: !canManageSession,
										},
										config: {
											title: `Edit "${event.title}"`,
											size: "2xl",
											className: "rounded-none",
										},
									});
								}}
								className="h-8 w-8 rounded-none p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 [&_svg]:text-blue-600 hover:[&_svg]:text-blue-700"
								title="Edit"
							>
								<Pencil className="size-4" />
							</Button>
						)}

						{canManageSession && !isArchived && (
							<Button
								variant="outline"
								size="icon-sm"
								onClick={handleArchive}
								className="h-8 w-8 rounded-none p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 [&_svg]:text-amber-600 hover:[&_svg]:text-amber-700"
								title="Archive session"
							>
								<Archive className="size-4" />
							</Button>
						)}

						{canManageSession && isArchived && (
							<Button
								variant="outline"
								size="icon-sm"
								onClick={handleUnarchive}
								className="h-8 w-8 rounded-none p-0 text-green-600 hover:bg-green-50 hover:text-green-700 [&_svg]:text-green-600 hover:[&_svg]:text-green-700"
								title="Restore / Unarchive session"
							>
								<ArchiveRestore className="size-4" />
							</Button>
						)}
					</ButtonGroup>
				</div>

				{/* Tags */}
				<ExpandableTags
					tags={offeringTags}
					limit={2}
					singleRow
					colorful
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
										size: "lg",
										className: "rounded-none",
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
										size: "2xl",
										className: "rounded-none",
									},
								});
							}}
							className="h-8 w-full justify-center rounded-none text-xs"
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
