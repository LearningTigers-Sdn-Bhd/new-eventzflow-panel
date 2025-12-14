"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RedemptionLog } from "@/lib/api/voucher-redemption-log";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<RedemptionLog>[] = [
	{
		accessorKey: "redemptionTimestamp",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Time</p>
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
			const date = new Date(row.getValue("redemptionTimestamp"));
			return (
				<div className="text-sm">
					<div className="font-medium">
						{date.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</div>
					<div className="text-muted-foreground text-xs">
						{date.toLocaleTimeString("en-US", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
			);
		},
	},
	{
		id: "voucher",
		size: 200,
		accessorFn: (row) => row.voucher?.title,
		header: () => <p className="font-medium">Voucher</p>,
		cell: ({ row }) => {
			const voucher = row.original.voucher;
			return (
				<div className="space-y-0.5">
					<div className="font-medium">{voucher?.title || "-"}</div>
					<div className="text-muted-foreground text-xs">
						{voucher?.voucherCode || "-"}
					</div>
				</div>
			);
		},
	},
	{
		id: "redeemer",
		size: 200,
		accessorFn: (row) => row.redeemer?.fullName,
		header: () => <p className="font-medium">Redeemer</p>,
		cell: ({ row }) => {
			const redeemer = row.original.redeemer;
			return (
				<div className="space-y-0.5">
					<div className="font-medium">{redeemer?.fullName || "-"}</div>
					<div className="text-muted-foreground text-xs">
						{redeemer?.email || redeemer?.phone || "-"}
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "redeemerType",
		size: 120,
		header: () => <p className="font-medium">Type</p>,
		cell: ({ row }) => {
			const type = row.getValue("redeemerType") as
				| "user_redeemer"
				| "visitor_redeemer";
			const isUser = type === "user_redeemer";
			return (
				<Badge
					variant={isUser ? "default" : "secondary"}
					className="rounded-none capitalize"
				>
					{isUser ? "User" : "Visitor"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "redemptionStatus",
		size: 120,
		header: () => <p className="font-medium">Status</p>,
		cell: ({ row }) => {
			const status = row.getValue("redemptionStatus") as
				| "completed"
				| "cancelled";
			const isCompleted = status === "completed";
			return (
				<Badge
					variant={isCompleted ? "default" : "destructive"}
					className="rounded-none capitalize"
				>
					{isCompleted ? "Completed" : "Cancelled"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "transactionGrossAmount",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Original Price</p>
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
			const amount = row.getValue("transactionGrossAmount") as number;
			return <div className="font-medium">RM {amount.toFixed(2)}</div>;
		},
	},
	{
		accessorKey: "discountAppliedValue",
		size: 120,
		header: () => <p className="font-medium">Discount</p>,
		cell: ({ row }) => {
			const discount = row.getValue("discountAppliedValue") as number;
			return (
				<div className="font-medium text-green-600">
					-RM {discount.toFixed(2)}
				</div>
			);
		},
	},
	{
		accessorKey: "transactionNetAmount",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Price after Discount</p>
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
			const amount = row.getValue("transactionNetAmount") as number;
			return <div className="font-bold">RM {amount.toFixed(2)}</div>;
		},
	},
];
