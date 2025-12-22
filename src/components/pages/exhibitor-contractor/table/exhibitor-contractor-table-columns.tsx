"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { cn } from "@/lib/utils";
import { ContractorActionsMenu } from "./action-menu";

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

export const columns: ColumnDef<ExhibitionContractor>[] = [
	{
		accessorKey: "full_name",
		size: 150,
		header: ({ column }) => (
			<SortableHeader column={column} label="Full Name" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		id: "company_name",
		accessorFn: (row) => row.exhibition_contractor_profile?.company_name ?? "-",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="Company Name" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("company_name")}</div>
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
		size: 150,
		header: ({ column }) => <SortableHeader column={column} label="Phone" />,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("phone") || "-"}
			</div>
		),
	},
	{
		accessorKey: "status",
		size: 100,
		filterFn: (row, id, value) => {
			if (value === undefined) return true;
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
			return (
				<Badge
					variant={status === "active" ? "default" : "secondary"}
					className={cn(
						status === "active"
							? "bg-green-100 text-green-800 hover:bg-green-100"
							: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						"rounded-none capitalize",
					)}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "created_at",
		size: 130,
		header: ({ column }) => (
			<SortableHeader column={column} label="Created At" />
		),
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			return <div>{formatDate(row.getValue("created_at"))}</div>;
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
			const contractor = row.original;
			return (
				<div className="flex justify-center">
					<ContractorActionsMenu contractor={contractor} />
				</div>
			);
		},
	},
];
