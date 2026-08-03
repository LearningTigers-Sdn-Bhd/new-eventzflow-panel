"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Clock, MapPin, User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import AttachHostDialog from "./attach-host-dialog";
import AvailabilityDialog from "./availability-dialog";
import BookingsDialog from "./bookings-dialog";
import HostDetailsDialog from "./host-details-dialog";
import CreateSessionDialog from "./create-session-dialog";

export const columns: ColumnDef<BusinessMatchingEvent>[] = [
	{
		accessorKey: "title",
		header: "Session Details",
		cell: ({ row }) => {
			const event = row.original;
			const offeringTags = event.offering_tags || [];
			return (
				<div className="flex flex-col gap-1 py-1 max-w-[280px]">
					<span className={`font-semibold text-foreground leading-snug break-words block ${
						event.title.length > 40 ? "text-xs" : "text-sm"
					}`}>
						{event.title}
					</span>
					{event.location && (
						<span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
							<MapPin className="h-3 w-3 shrink-0" />
							{event.location}
						</span>
					)}
					{offeringTags.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-1">
							{offeringTags.slice(0, 3).map((tag) => (
								<span
									key={tag}
									className="inline-flex items-center rounded bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-primary border border-primary/10"
								>
									{tag}
								</span>
							))}
							{offeringTags.length > 3 && (
								<span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
									+{offeringTags.length - 3}
								</span>
							)}
						</div>
					)}
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
							className="inline-flex items-center rounded-full bg-primary/10 hover:bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary transition-colors border border-primary/20 cursor-pointer"
						>
							{count} booking{count !== 1 ? "s" : ""}
						</button>
					</div>
					{event.created_at && (
						<div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
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
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const { canManageEvent } = useEventPermissions(row.original.event_id);

			return (
				<div className="flex gap-1.5 py-1">
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							openDialog({
								component: AvailabilityDialog,
								props: {
									bmEventId: row.original.id,
									eventId: row.original.event_id,
									eventTitle: row.original.title,
								},
								config: {
									title: `Availability for ${row.original.title}`,
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
										eventId: row.original.event_id,
										session: row.original,
									},
									config: {
										title: `Edit "${row.original.title}"`,
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
			);
		},
	},
];
