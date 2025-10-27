"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowDownLeft, ArrowUpRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFormatDate } from "@/hooks/use-format-date";
import type { TransactionLog } from "@/lib/api/credits";
import { cn } from "@/lib/utils";

export const transactionColumns: ColumnDef<TransactionLog>[] = [
	{
		accessorKey: "date",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Date</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			const date = new Date(row.getValue("date"));
			const { formatDate } = useFormatDate();
			return <div className="text-sm">{formatDate(date)}</div>;
		},
	},
	{
		accessorKey: "description",
		size: 400,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Description</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			return <div className="font-medium">{row.getValue("description")}</div>;
		},
	},
	{
		accessorKey: "type",
		size: 150,
		header: () => {
			return <p className="font-medium">Type</p>;
		},
		cell: ({ row }) => {
			const type = row.getValue("type") as string;
			return (
				<Badge
					variant={
						type === "purchase"
							? "default"
							: type === "refund"
								? "secondary"
								: "outline"
					}
					className="capitalize"
				>
					{type === "purchase" && <ArrowUpRight className="mr-1 size-3" />}
					{type === "refund" && <ArrowDownLeft className="mr-1 size-3" />}
					{type === "bonus" && <Gift className="mr-1 size-3" />}
					{type}
				</Badge>
			);
		},
	},
	{
		accessorKey: "amount",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Amount</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			const amount = row.getValue("amount") as number;
			return (
				<div
					className={`font-semibold ${
						amount > 0 ? "text-green-600" : "text-red-600"
					}`}
				>
					{amount > 0 ? "+" : ""}
					{amount}
				</div>
			);
		},
	},
	{
		accessorKey: "balance",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Balance</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
			const balance = row.getValue("balance") as number;
			return <div className="font-medium">{balance.toLocaleString()}</div>;
		},
	},
];
