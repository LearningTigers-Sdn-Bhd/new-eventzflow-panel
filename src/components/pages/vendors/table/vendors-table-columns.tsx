"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@/lib/api/vendor";
import { cn } from "@/lib/utils";
import { VendorActionsMenu } from "./action-menu";

export type BaseVendor = Vendor;

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

export function generateColumns(): ColumnDef<BaseVendor>[] {
	return [
		{
			accessorKey: "full_name",
			size: 200,
			header: ({ column }) => (
				<SortableHeader column={column} label="Vendor Name" />
			),
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("full_name")}</div>
			),
		},
		{
			id: "person_in_charge",
			size: 180,
			accessorFn: (row) => row.vendorProfile?.person_in_charge,
			header: () => <p className="font-medium">Person In Charge</p>,
			cell: ({ row }) => {
				const personInCharge = row.original.vendorProfile?.person_in_charge;
				return <div className="text-sm">{personInCharge || "-"}</div>;
			},
		},
		{
			id: "contact",
			size: 250,
			header: () => <p className="font-medium">Contact</p>,
			cell: ({ row }) => {
				const vendor = row.original;
				return (
					<div className="space-y-0.5 text-sm">
						<div className="text-muted-foreground">{vendor.email}</div>
						{vendor.phone && (
							<div className="text-muted-foreground text-xs">
								{vendor.phone}
							</div>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "status",
			size: 120,
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
			id: "actions",
			size: 80,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const vendor = row.original;
				return (
					<div className="flex justify-center">
						<VendorActionsMenu vendor={vendor} />
					</div>
				);
			},
		},
	];
}
