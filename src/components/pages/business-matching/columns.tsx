"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
	Archive,
	ArchiveRestore,
	Calendar,
	CalendarCheck,
	Clock,
	MapPin,
	Pencil,
	UserPlus,
} from "lucide-react";
import { ExpandableTags } from "@/components/admin-ui/expandable-tags";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";
import ArchiveSessionDialog, {
	RestoreSessionDialog,
} from "./archive-session-dialog";
import AttachHostDialog from "./attach-host-dialog";
import CreateSessionDialog from "./create-session-dialog";
import HostDetailsDialog from "./host-details-dialog";

const STATUS_BADGE = {
	active: "bg-green-100 text-green-800 hover:bg-green-100",
	needsHost: "bg-amber-100 text-amber-800 hover:bg-amber-100",
	archived: "bg-gray-100 text-gray-800 hover:bg-gray-100",
} as const;

function sessionStatus(event: BusinessMatchingEvent) {
	if (event.is_archived ?? !!event.archived_at) {
		return { label: "Archived", className: STATUS_BADGE.archived };
	}
	if (!event.host) {
		return { label: "Needs host", className: STATUS_BADGE.needsHost };
	}
	return { label: "Active", className: STATUS_BADGE.active };
}

function formatDateRange(start?: string, end?: string) {
	if (!start) return null;
	const from = parseISO(start);
	const to = end ? parseISO(end) : from;
	if (from.getTime() === to.getTime()) return format(from, "d MMM yyyy");
	return `${format(from, "d MMM")} – ${format(to, "d MMM yyyy")}`;
}

export const columns: ColumnDef<BusinessMatchingEvent>[] = [
	{
		accessorKey: "title",
		size: 320,
		header: ({ column }) => <SortableHeader column={column} label="Session" />,
		cell: ({ row }) => {
			const event = row.original;
			return (
				<div className="flex max-w-[300px] flex-col gap-1.5 py-2">
					<span className="break-words font-semibold text-foreground text-sm leading-snug">
						{event.title}
					</span>
					{event.location && (
						<span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
							<MapPin className="h-3 w-3 shrink-0" />
							{event.location}
						</span>
					)}
					<ExpandableTags
						tags={event.offering_tags || []}
						limit={3}
						colorful
						tagClassName="text-xs"
					/>
				</div>
			);
		},
	},
	{
		id: "schedule",
		size: 190,
		accessorFn: (row) => row.start_date ?? "",
		header: ({ column }) => <SortableHeader column={column} label="Schedule" />,
		cell: ({ row }) => {
			const { start_date, end_date, start_time, end_time } = row.original;
			const range = formatDateRange(start_date, end_date);
			if (!range) return <span className="text-muted-foreground">—</span>;
			return (
				<div className="flex flex-col gap-1 py-2 text-xs">
					<span className="flex items-center gap-1.5 font-medium text-foreground">
						<Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						{range}
					</span>
					{start_time && end_time && (
						<span className="flex items-center gap-1.5 text-muted-foreground">
							<Clock className="h-3.5 w-3.5 shrink-0" />
							{start_time} – {end_time}
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "host",
		size: 240,
		header: "Host",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			const { permissions } = useEventSidebarContext();
			const { isBusinessHost, canManageEvent, isBusinessMatchingAdmin } =
				permissions;
			const canManageHosts = canManageEvent || isBusinessMatchingAdmin;
			const host = row.original.host;

			if (!host) {
				return (
					<Button
						variant="outline"
						size="sm"
						disabled={isBusinessHost && !canManageHosts}
						onClick={() => {
							openDialog({
								component: AttachHostDialog,
								props: { bmEvent: row.original },
								config: {
									title: `Attach Host to "${row.original.title}"`,
									size: "lg",
									className: "rounded-none",
								},
							});
						}}
						className="h-8 rounded-none border-dashed text-xs"
					>
						<UserPlus className="h-3.5 w-3.5" />
						Attach a host
					</Button>
				);
			}

			const initials = host.full_name
				.split(" ")
				.map((w) => w[0])
				.slice(0, 2)
				.join("")
				.toUpperCase();

			return (
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
								// "sm" felt cramped for the tabbed content below — bump
								// width and height a bit. Desktop-only: this className
								// is dropped on the mobile/tablet dialog variant, which
								// already goes full-screen.
								size: "lg",
								className: "rounded-none sm:max-h-[90vh]",
							},
						});
					}}
					className="group/host flex max-w-[220px] items-center gap-2.5 py-2 text-left"
				>
					<Avatar className="h-10 w-10">
						<AvatarImage src={host.avatar_url ?? undefined} />
						<AvatarFallback className="bg-primary/10 font-semibold text-primary text-sm">
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className="flex min-w-0 flex-col">
						<span className="truncate font-medium text-foreground text-sm group-hover/host:underline">
							{host.full_name}
						</span>
						<span className="truncate text-muted-foreground text-xs">
							{host.email}
						</span>
					</span>
				</button>
			);
		},
	},
	{
		id: "status",
		size: 120,
		accessorFn: (row) => sessionStatus(row).label,
		header: "Status",
		cell: ({ row }) => {
			const { label, className } = sessionStatus(row.original);
			return (
				<Badge variant="secondary" className={cn("rounded-none", className)}>
					{label}
				</Badge>
			);
		},
	},
	{
		id: "activity",
		size: 170,
		accessorFn: (row) => row.bookings_count ?? 0,
		header: ({ column }) => <SortableHeader column={column} label="Bookings" />,
		cell: ({ row }) => {
			const event = row.original;
			const count = event.bookings_count ?? 0;

			return (
				<div className="flex flex-col gap-1 py-2">
					<Badge
						variant={count > 0 ? "default" : "secondary"}
						className={cn(
							"rounded-none",
							count > 0
								? "bg-blue-100 text-blue-800 hover:bg-blue-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						)}
					>
						<CalendarCheck />
						{count} booking{count !== 1 ? "s" : ""}
					</Badge>
					{event.updated_at && (
						<span className="text-foreground/70 text-xs">
							Updated {format(parseISO(event.updated_at), "d MMM, h:mm a")}
						</span>
					)}
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 120,
		enableHiding: false,
		meta: { sticky: "right" },
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => <SessionActionsCell event={row.original} />,
	},
];

function SessionActionsCell({ event }: { event: BusinessMatchingEvent }) {
	const { openDialog } = useDialog();
	const { user } = useAuth();
	const { permissions } = useEventSidebarContext();
	const { canManageEvent, isBusinessHost, isBusinessMatchingAdmin } =
		permissions;
	const canManageSession = canManageEvent || isBusinessMatchingAdmin;

	const ownsSession =
		isBusinessHost &&
		!!user &&
		String(event.host?.id ?? "") === String(user.id);

	if (!canManageSession && !ownsSession) return null;

	const isArchived = event.is_archived ?? !!event.archived_at;
	const hasHost = !!event.host;
	const bookingsCount = event.bookings_count ?? 0;
	const canArchive = !hasHost && bookingsCount === 0;

	const handleArchive = () => {
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

	const handleUnarchive = () => {
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

	return (
		<ButtonGroup>
			{!isArchived && (
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => {
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
	);
}
