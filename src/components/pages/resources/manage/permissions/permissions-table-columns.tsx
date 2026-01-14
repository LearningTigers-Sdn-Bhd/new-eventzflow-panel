"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck } from "lucide-react";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import type { ResourcePermission } from "@/lib/api/resource/permission";
import { cn } from "@/lib/utils";
import { PermissionsActionsMenu } from "./permissions-action-menu";

const STATUS_OPTIONS = [
	{ label: "Regular", value: "base" },
	{ label: "Partnership", value: "partnership" },
];

const baseColumns: ColumnDef<ResourcePermission>[] = [
	{
		id: "index",
		header: "No.",
		size: 50,
		cell: ({ row }) => <div>{row.index + 1}</div>,
	},
	{
		accessorFn: (row) => row.user.fullName,
		id: "fullName",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => (
			<div className="font-medium">{row.original.user.fullName}</div>
		),
	},
	{
		accessorFn: (row) => row.user.email,
		id: "email",
		size: 220,
		header: ({ column }) => <SortableHeader column={column} label="Email" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.original.user.email}
			</div>
		),
	},
	{
		accessorFn: (row) => row.user.phone,
		id: "phone",
		size: 150,
		header: ({ column }) => <SortableHeader column={column} label="Phone" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.original.user.phone || "-"}
			</div>
		),
	},
	{
		accessorKey: "status",
		size: 140,
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
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			const statusLabel = status === "partnership" ? "Partnership" : "Regular";
			return (
				<Badge
					className={cn(
						"min-w-20 rounded-none font-bold capitalize",
						status === "partnership" ? "bg-purple-500" : "bg-blue-500",
					)}
				>
					{statusLabel}
				</Badge>
			);
		},
	},
	{
		accessorKey: "isOfficial",
		size: 140,
		header: () => <div className="text-left">Official</div>,
		cell: ({ row }) => {
			const isOfficial = row.getValue("isOfficial") as boolean;
			return (
				<Badge
					variant="outline"
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						isOfficial
							? "border-purple-500 text-purple-500"
							: "border-muted-foreground text-muted-foreground",
					)}
				>
					{isOfficial ? (
						<>
							<ShieldCheck className="mr-1 h-3 w-3" />
							Official
						</>
					) : (
						"Member"
					)}
				</Badge>
			);
		},
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
];

const actionsColumn: ColumnDef<ResourcePermission> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	header: () => <div className="text-center">Actions</div>,
	meta: {
		sticky: "right",
	},
	cell: ({ row }) => {
		const permission = row.original;
		return (
			<div className="flex justify-center">
				<PermissionsActionsMenu permission={permission} />
			</div>
		);
	},
};

export const columns: ColumnDef<ResourcePermission>[] = [
	...baseColumns,
	actionsColumn,
];
