"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FilterableHeader } from "@/components/admin-ui/table/header/filterable-header";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import type { Voucher as ApiVoucher } from "@/lib/api/voucher";
import { cn } from "@/lib/utils";
import { VoucherActionsMenu } from "./action-menu";

// Re-export the API Voucher type as BaseVoucher for consistency
export type BaseVoucher = ApiVoucher;

// Re-export as Voucher for backward compatibility
export type Voucher = ApiVoucher;

// Status filter options
const STATUS_OPTIONS = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
	{ label: "Expired", value: "expired" },
];

// Base columns
const baseColumns: ColumnDef<BaseVoucher>[] = [
	{
		accessorKey: "title",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="Voucher Title" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("title")}</div>
		),
	},
	{
		id: "merchant",
		accessorFn: (row) => row.vendor?.fullName || "N/A",
		size: 180,
		header: ({ column }) => (
			<SortableHeader column={column} label="Merchant Name" />
		),
		cell: ({ row }) => (
			<div className="text-sm">{row.original.vendor?.fullName || "N/A"}</div>
		),
	},
	{
		accessorKey: "voucherType",
		size: 150,
		header: ({ column }) => <SortableHeader column={column} label="Type" />,
		cell: ({ row }) => {
			const type = row.getValue("voucherType") as string;
			return (
				<div className="text-sm capitalize">
					{(type || "").replace(/_/g, " ")}
				</div>
			);
		},
	},
	{
		accessorKey: "voucherValue",
		size: 120,
		header: ({ column }) => <SortableHeader column={column} label="Value" />,
		cell: ({ row }) => {
			const value = row.getValue("voucherValue") as number;
			const type = row.original.voucherType;
			return (
				<div className="font-medium">
					{type === "free_item"
						? "-"
						: type === "percentage"
							? `${value}%`
							: `RM ${value.toFixed(2)}`}
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
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "active" ? "default" : "secondary"}
					className={cn(
						"w-full min-w-20 max-w-24 rounded-none font-bold capitalize",
						status === "active" && "bg-green-500 text-white",
						status === "inactive" && "bg-gray-500 text-white",
						status === "expired" && "bg-red-500 text-white",
					)}
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "startDate",
		id: "validity",
		size: 180,
		header: ({ column }) => <SortableHeader column={column} label="Validity" />,
		cell: ({ row }) => {
			const { formatDate } = useFormatDate();
			const startDate = row.original.startDate;
			const endDate = row.original.endDate;
			return (
				<div className="flex flex-col gap-1">
					<div className="text-sm">
						<span className="text-muted-foreground">Start: </span>
						{formatDate(startDate)}
					</div>
					<div className="text-sm">
						<span className="text-muted-foreground">End: </span>
						{formatDate(endDate)}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "totalRedemptionAvailable",
		size: 140,
		header: ({ column }) => (
			<div className="flex items-center justify-center">
				<SortableHeader column={column} label="Quota" />
			</div>
		),
		cell: ({ row }) => {
			const isUnlimited = row.original.isUnlimited;
			const total = row.getValue("totalRedemptionAvailable") as number | null;
			return (
				<div className="text-center font-medium">
					{isUnlimited ? "Unlimited" : total}
				</div>
			);
		},
	},
	{
		id: "redemptions",
		size: 160,
		header: () => <p className="font-medium">Redemptions</p>,
		cell: ({ row }) => {
			const isUnlimited = row.original.isUnlimited;
			const total = row.original.totalRedemptionAvailable ?? 0;
			const redeemed = row.original.redeemedCount || 0;
			const remaining = total - redeemed;
			return (
				<div className="flex flex-col gap-1">
					<div className="font-medium text-green-600 text-sm">
						{isUnlimited ? "Unlimited" : `${remaining} left`}
					</div>
					<div className="text-muted-foreground text-xs">
						{redeemed} {isUnlimited ? "redeemed" : `/ ${total} redeemed`}
					</div>
				</div>
			);
		},
	},
];

// Actions column
const actionsColumn: ColumnDef<BaseVoucher> = {
	id: "actions",
	size: 80,
	enableHiding: false,
	meta: {
		sticky: "right",
	},
	header: () => <div className="text-center">Actions</div>,
	cell: ({ row }) => {
		const voucher = row.original;
		return (
			<div className="flex justify-center">
				<VoucherActionsMenu voucher={voucher} />
			</div>
		);
	},
};

// Function to get columns based on permissions
export const getVoucherColumns = (
	canManageVouchers = false,
): ColumnDef<BaseVoucher>[] => {
	if (canManageVouchers) {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export
export const columns: ColumnDef<BaseVoucher>[] = [
	...baseColumns,
	actionsColumn,
];
