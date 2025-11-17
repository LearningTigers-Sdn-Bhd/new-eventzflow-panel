"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import type { Group } from "@/lib/api/group/response";
import { GroupActionsMenu } from "./action-menu";

export const columns: ColumnDef<Group>[] = [
	{
		accessorKey: "name",
		size: 250,
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
		accessorKey: "description",
		size: 350,
		header: () => <p className="font-medium">Description</p>,
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{row.getValue("description") || "—"}
			</div>
		),
	},
	{
		accessorKey: "created_at",
		size: 150,
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
		size: 160,
		enableHiding: false,
		header: "Actions",
		cell: ({ row }) => {
			const group = row.original;
			return <GroupActionsMenu group={group} />;
		},
	},
];
