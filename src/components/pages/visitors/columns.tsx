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
						<p className="font-medium">Created</p>
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
				const createdAt = row.getValue("created_at") as string;
				return (
					<div className="text-sm">
						{new Date(createdAt).toLocaleDateString()} at{" "}
						{new Date(createdAt).toLocaleTimeString()}
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
