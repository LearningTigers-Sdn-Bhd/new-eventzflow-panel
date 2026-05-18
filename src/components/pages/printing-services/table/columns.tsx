"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFormatDate } from "@/hooks/use-format-date";
import type { PrintingService } from "@/lib/api/printing-service";
import { cn } from "@/lib/utils";
import { PrintingServiceActionsMenu } from "./action-menu";

export const columns: ColumnDef<PrintingService>[] = [
	{
		accessorKey: "name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Name</p>
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
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		id: "category",
		accessorFn: (row) => row.itemCategory?.name ?? "-",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Category</p>
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
			<Badge variant="outline" className="rounded-none">
				{row.getValue("category")}
			</Badge>
		),
	},
	{
		accessorKey: "unitOfMeasure",
		size: 120,
		header: () => <p className="font-medium">Unit</p>,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("unitOfMeasure")}
			</div>
		),
	},
	{
		accessorKey: "defaultPrice",
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Price</p>
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
			const price = row.getValue("defaultPrice") as number;
			return (
				<div className="font-medium">
					{new Intl.NumberFormat("en-MY", {
						style: "currency",
						currency: "MYR",
					}).format(price)}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		size: 100,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Status</p>
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
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "active" ? "default" : "secondary"}
					className="rounded-none capitalize"
				>
					{status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "createdAt",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Created At</p>
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
			const date = new Date(row.getValue("createdAt"));
			const formattedDate = formatDate(row.getValue("createdAt"));
			const time = date.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			});
			return (
				<div className="text-sm">
					<div>{formattedDate}</div>
					<div className="text-muted-foreground text-xs">{time}</div>
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const service = row.original;
			return (
				<div className="flex justify-center">
					<PrintingServiceActionsMenu service={service} />
				</div>
			);
		},
	},
];
