"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import type { Voucher as ApiVoucher } from "@/lib/api/voucher";
import { VoucherActionsMenu } from "./action-menu";

// Re-export the API Voucher type for use in the table
export type Voucher = ApiVoucher;

// Base columns
const baseColumns: ColumnDef<Voucher>[] = [
	{
		accessorKey: "title",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Voucher Title</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("title")}</div>
		),
	},
	{
		id: "merchant",
		accessorFn: (row) => row.vendor?.fullName || "N/A",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Merchant Name</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-sm">{row.original.vendor?.fullName || "N/A"}</div>
		),
	},
	{
		accessorKey: "voucherType",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Type</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Value</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
			return row.getValue(id) === value;
		},
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as
				| "active"
				| "inactive"
				| "expired"
				| undefined;
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex items-center gap-2">
							<p className="font-medium">
								Status
								{filterStatus && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs capitalize underline"
									>
										{filterStatus}
									</Badge>
								)}
							</p>
							<ChevronDown className="size-4" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none bg-background"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("active")}
						>
							Active
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("inactive")}
						>
							Inactive
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("expired")}
						>
							Expired
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Validity</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
		header: ({ column }) => {
			return (
				<div className="flex items-center justify-center gap-2">
					<p className="font-medium">Quota</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
const actionsColumn: ColumnDef<Voucher> = {
	id: "actions",
	size: 80,
	enableHiding: false,
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
): ColumnDef<Voucher>[] => {
	if (canManageVouchers) {
		return [...baseColumns, actionsColumn];
	}
	return baseColumns;
};

// Default export
export const columns: ColumnDef<Voucher>[] = [...baseColumns, actionsColumn];
