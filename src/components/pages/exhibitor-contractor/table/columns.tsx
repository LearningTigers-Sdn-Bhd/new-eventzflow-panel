"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import type { ExhibitionContractor } from "@/lib/api/contractor";
import { ContractorActionsMenu } from "./action-menu";

export const columns: ColumnDef<ExhibitionContractor>[] = [
	{
		accessorKey: "full_name",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Full Name</p>
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
			<div className="font-medium">{row.getValue("full_name")}</div>
		),
	},
	{
		id: "company_name",
		accessorFn: (row) => row.exhibition_contractor_profile?.company_name ?? "-",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Company Name</p>
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
			<div className="font-medium">{row.getValue("company_name")}</div>
		),
	},
	{
		accessorKey: "email",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Email</p>
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
			<div className="text-muted-foreground text-sm">
				{row.getValue("email")}
			</div>
		),
	},
	{
		accessorKey: "phone",
		size: 150,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Phone</p>
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
			<div className="text-muted-foreground text-sm">
				{row.getValue("phone") || "-"}
			</div>
		),
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
		accessorKey: "created_at",
		size: 130,
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
			return <div>{formatDate(row.getValue("created_at"))}</div>;
		},
	},
	{
		id: "actions",
		size: 80,
		enableHiding: false,
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
