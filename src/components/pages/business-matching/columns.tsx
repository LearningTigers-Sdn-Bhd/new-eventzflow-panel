"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, Pencil, User } from "lucide-react";
import { ExpandableTags } from "@/components/admin-ui/expandable-tags";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import AttachHostDialog from "./attach-host-dialog";
import CreateSessionDialog from "./create-session-dialog";
import HostDetailsDialog from "./host-details-dialog";
import SessionActivityDialog from "./session-activity-dialog";

export const columns: ColumnDef<BusinessMatchingEvent>[] = [
	{
		accessorKey: "title",
		header: "Session Details",
		cell: ({ row }) => {
			const event = row.original;
			const offeringTags = event.offering_tags || [];
			return (
				<div className="flex flex-col gap-1 py-1 max-w-[280px]">
					<span
						className={`font-semibold text-foreground leading-snug break-words block ${
							event.title.length > 40 ? "text-xs" : "text-sm"
						}`}
					>
						{event.title}
					</span>
					{event.location && (
						<span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
							<MapPin className="h-3 w-3 shrink-0" />
							{event.location}
						</span>
					)}
					<ExpandableTags tags={offeringTags} limit={3} className="mt-1" />
				</div>
			);
		},
	},
	{
		accessorKey: "host",
		header: "Host Profile",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const { isBusinessHost, canManageEvent } = useEventPermissions(
				row.original.event_id,
			);
			const host = row.original.host;

			if (!host) {
				return (
					<Button
						variant="outline"
						size="sm"
						disabled={isBusinessHost && !canManageEvent}
						onClick={() => {
							openDialog({
								component: AttachHostDialog,
								props: { bmEvent: row.original },
								config: {
									title: `Attach Host to "${row.original.title}"`,
									size: "lg",
								},
							});
						}}
						className="h-8 text-xs"
					>
						Attach a host
					</Button>
				);
			}

			return (
				<div className="flex items-center gap-1.5 py-1 max-w-[200px]">
					<button
						type="button"
						onClick={() => {
							openDialog({
								component: HostDetailsDialog,
								props: {
									host,
									bmEventId: row.original.id,
									eventId: row.original.event_id,
								},
								config: {
									title: "Host Details",
									size: "md",
								},
							});
						}}
						className="font-semibold text-sm text-foreground hover:text-primary hover:underline flex items-center gap-1.5 transition-colors text-left"
					>
						<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						{host.full_name}
					</button>
				</div>
			);
		},
	},
	{
		id: "activity",
		header: "Activity & Stats",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const event = row.original;
			const count = event.bookings_count ?? 0;

			return (
				<div className="flex flex-col gap-1 py-1 text-xs">
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
							className="inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors border border-primary/20 cursor-pointer"
						>
							{count} booking{count !== 1 ? "s" : ""}
						</button>
					</div>
					{event.created_at && (
						<div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
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
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const { canManageEvent } = useEventPermissions(row.original.event_id);

			if (!canManageEvent) return null;

			return (
				<div className="flex gap-1.5 py-1">
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							openDialog({
								component: CreateSessionDialog,
								props: {
									eventId: row.original.event_id,
									session: row.original,
								},
								config: {
									title: `Edit "${row.original.title}"`,
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
			);
		},
	},
];
