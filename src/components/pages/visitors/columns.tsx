"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Visitor } from "@/lib/api/visitor";
import { VisitorActionsMenu } from "./action-menu";

export function generateColumns(): ColumnDef<Visitor>[] {
	return [
		{
			accessorKey: "full_name",
			size: 200,
			header: ({ column }) => (
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
			),
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<div className="truncate font-medium">{row.getValue("full_name")}</div>
					<div className="truncate text-muted-foreground text-sm">
						{row.original.phone || "No phone"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "phone",
			enableHiding: true,
			enableSorting: false,
			meta: {
				hidden: true,
			},
			header: () => null,
			cell: () => null,
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
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
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
				const email = row.getValue("email") as string | undefined;
				return (
					<div
						className={cn(
							"font-medium",
							!email && "text-muted-foreground italic",
						)}
					>
						{email || "Not provided"}
					</div>
				);
			},
		},
		{
			accessorKey: "created_at",
			size: 180,
			header: ({ column }) => {
				return (
					<div className="flex items-center gap-2">
						<p className="font-medium">Created At</p>
						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								column.toggleSorting(column.getIsSorted() === "asc")
							}
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
				const date = new Date(row.getValue("created_at"));

				// Time with 'short' style (e.g., "9:55 AM")
				const timePart = date.toLocaleString('en-US', { timeStyle: 'medium' }); 
				
				// Date with 'medium' style (e.g., "Nov 24, 2025")
				const datePart = date.toLocaleString('en-US', { dateStyle: 'medium' });

				return (
					<div className="font-medium">
						{/* Time: Use a stronger class like "font-bold" */}
						<div className="font-semibold">{timePart}</div> 
						
						{/* Date: Use a slightly less pronounced style or default */}
						<div className="text-gray-500 text-sm">{datePart}</div> 
					</div>
				);
			},
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			size: 120,
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const visitor = row.original;
				return (
					<div className="flex justify-center">
						<VisitorActionsMenu visitor={visitor} />
					</div>
				);
			},
		},
	];
}
