"use client";

import type { ColumnDef, TableMeta } from "@tanstack/react-table";
import { ArrowDown, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TeamMemberRow {
	id?: number;
	full_name: string;
	created_at?: string;
	_destroy?: boolean;
	isFree: boolean;
	fee: number;
	index: number;
}

export interface TeamMembersTableMeta extends TableMeta<TeamMemberRow> {
	onRemoveMember?: (member: TeamMemberRow) => void;
}

const formatDate = (dateString?: string) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-MY", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

export const teamMembersColumns: ColumnDef<TeamMemberRow>[] = [
	{
		accessorKey: "index",
		id: "no",
		size: 60,
		header: () => <p className="font-medium">No.</p>,
		cell: ({ row }) => <div className="text-sm">{row.original.index + 1}</div>,
	},
	{
		accessorKey: "full_name",
		id: "name",
		size: 250,
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
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		id: "slot",
		size: 120,
		header: () => <p className="font-medium">Slot</p>,
		cell: ({ row }) => {
			const { isFree, fee } = row.original;
			if (isFree) {
				return (
					<Badge
						variant="outline"
						className="rounded-none border-green-500 text-green-600 text-xs"
					>
						Free
					</Badge>
				);
			}
			return (
				<Badge
					variant="outline"
					className="rounded-none border-amber-500 text-amber-600 text-xs"
				>
					+RM {fee.toFixed(2)}
				</Badge>
			);
		},
	},
	{
		accessorKey: "created_at",
		id: "created_at",
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
		cell: ({ row }) => (
			<div className="text-muted-foreground text-sm">
				{formatDate(row.getValue("created_at"))}
			</div>
		),
	},
	{
		id: "actions",
		size: 80,
		header: () => <div className="text-center font-medium">Actions</div>,
		cell: ({ row, table }) => {
			const member = row.original;
			const meta = table.options.meta as TeamMembersTableMeta | undefined;

			return (
				<div className="flex justify-center">
					<Button
						onClick={() => meta?.onRemoveMember?.(member)}
						size="sm"
						variant="ghost"
						className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			);
		},
	},
];
