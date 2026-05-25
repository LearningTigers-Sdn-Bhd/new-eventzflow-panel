"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import { TeamMemberActionsMenu } from "./action-menu";

export type TeamMember = {
	id: string;
	full_name: string;
	email: string;
	phone?: string;
	role: "org_owner" | "organizer" | "member" | "vendor" | "exhibitor" | "exhibition_contractor";
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
	createdById?: string | null;
	emailVerifiedAt?: string | null;
};

// Role filter options
const ROLE_OPTIONS = [
	{ label: "Owner", value: "org_owner" },
	{ label: "Organizer", value: "organizer" },
	{ label: "Member", value: "member" },
	{ label: "Vendor", value: "vendor" },
	{ label: "Exhibitor", value: "exhibitor" },
	{ label: "Exhibition Contractor", value: "exhibition_contractor" },
];

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

export const columns: ColumnDef<TeamMember>[] = [
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
		size: 250,
		header: ({ column }) => <SortableHeader column={column} label="Email" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("email")}
			</div>
		),
	},
	{
		accessorKey: "phone",
		size: 180,
		header: ({ column }) => <SortableHeader column={column} label="Phone" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("phone") || "-"}
			</div>
		),
	},
	{
		accessorKey: "role",
		size: 120,
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
		header: ({ column }) => (
			<FilterableHeader
				column={column}
				label="Role"
				options={ROLE_OPTIONS}
				allOptionLabel="All Roles"
			/>
		),
		cell: ({ row }) => {
			const role = row.getValue("role") as string;
			const roleLabel =
				role === "org_owner"
					? "Owner"
					: role === "organizer"
						? "Organizer"
						: role === "vendor"
							? "Vendor"
							: "Member";
			return (
				<Badge
					variant="outline"
					className={cn(
						"min-w-16 rounded-none font-bold capitalize",
						role === "org_owner" && "border-purple-500 text-purple-500",
						role === "organizer" && "border-blue-500 text-blue-500",
						role === "vendor" && "border-orange-500 text-orange-500",
						role === "member" && "border-gray-500 text-gray-500",
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
			<SortableHeader column={column} label="Created At" />
		),
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			return <div>{formatDate(row.getValue("createdAt"))}</div>;
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		meta: {
			sticky: "right",
		},
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const member = row.original;
			return (
				<div className="flex justify-center">
					<TeamMemberActionsMenu member={member} />
				</div>
			);
		},
	},
];
