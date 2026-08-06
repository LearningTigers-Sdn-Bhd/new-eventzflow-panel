"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import type { EventStaffMember } from "@/lib/api/event/event-staff";
import { cn } from "@/lib/utils";
import { EventStaffActionsMenu } from "./action-menu";

// Filter options
const EVENT_ROLE_OPTIONS = [
	{ label: "Admin", value: "event_admin" },
	{ label: "Team Member", value: "event_team_member" },
	{ label: "Business Host", value: "business_host" },
	{ label: "Business Matching Admin", value: "business_matching_admin" },
];

const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

// Base columns that are always shown
const baseColumns: ColumnDef<EventStaffMember>[] = [
	{
		accessorKey: "full_name",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		accessorKey: "email",
		size: 220,
		header: ({ column }) => <SortableHeader column={column} label="Email" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("email")}
			</div>
		),
	},
	{
		accessorKey: "phone",
		size: 150,
		header: ({ column }) => <SortableHeader column={column} label="Phone" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("phone") || "-"}
			</div>
		),
	},
	{
		accessorKey: "eventRole",
		size: 140,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Event Role"
				options={EVENT_ROLE_OPTIONS}
				allOptionLabel="All Roles"
			/>
		),
		cell: ({ row }) => {
			const role = row.getValue("eventRole") as string;
			const roleLabel =
				role === "event_admin"
					? "Admin"
					: role === "business_host"
						? "Business Host"
						: role === "business_matching_admin"
							? "BM Admin"
							: "Team Member";
			return (
				<Badge
					variant="outline"
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						role === "event_admin" && "border-purple-500 text-purple-500",
						role === "event_team_member" && "border-blue-500 text-blue-500",
						role === "business_host" && "border-orange-500 text-orange-500",
						role === "business_matching_admin" &&
							"border-teal-500 text-teal-500",
					)}
				>
					{roleLabel}
				</Badge>
			);
		},
	},
	{
		accessorKey: "status",
		size: 120,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Status"
				options={STATUS_OPTIONS}
				allOptionLabel="All Status"
			/>
		),
		cell: ({ row }) => (
			<Badge
				className={cn(
					"min-w-16 rounded-none font-bold capitalize",
					row.getValue("status") === "active" && "bg-green-500",
					row.getValue("status") === "inactive" && "bg-red-500",
				)}
			>
				{row.getValue("status")}
			</Badge>
		),
	},
	{
		accessorKey: "createdAt",
		size: 130,
		header: ({ column }) => (
			<SortableHeader column={column} label="Assigned At" />
		),
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			return <div>{formatDate(row.getValue("createdAt"))}</div>;
		},
	},
];

// Actions column (only for org_owner)
const actionsColumn: ColumnDef<EventStaffMember> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const member = row.original;
		return (
			<div className="flex justify-center">
				<EventStaffActionsMenu member={member} />
			</div>
		);
	},
};

// Function to get columns based on user role
export const getEventStaffColumns = (
	userRole?:
		| "org_owner"
		| "organizer"
		| "member"
		| "vendor"
		| "exhibitor"
		| "exhibition_contractor",
): ColumnDef<EventStaffMember>[] => {
	// Only org_owner and organizer can see actions column
	if (userRole === "org_owner" || userRole === "organizer") {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export for backward compatibility (with actions column)
export const columns: ColumnDef<EventStaffMember>[] = [
	...baseColumns,
	actionsColumn,
];
