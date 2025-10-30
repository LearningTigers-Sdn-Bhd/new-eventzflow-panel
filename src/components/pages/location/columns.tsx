"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { LocationActionsMenu } from "./action-menu";

export type BaseLocation = {
	id: string;
	name: string;
    scanLimit: number | null;
    isUnlimited?: boolean;
	assignedMembers: Array<{
		id: string;
		name: string;
		email: string;
	}>;
};

export const columns: ColumnDef<BaseLocation>[] = [
	{
		accessorKey: "id",
		size: 140,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Location ID</p>
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
			const { copyToClipboard } = useCopyToClipboard({
				successMessage: "Location ID copied to clipboard",
			});

			return (
				<div className="flex items-center gap-2 text-center font-medium">
					<p className="truncate">{row.getValue("id")}</p>
					<Button
						variant="ghost"
						size="icon"
						className="hover:border"
						onClick={() => copyToClipboard(row.getValue("id"))}
					>
						<Copy className="size-4" />
					</Button>
				</div>
			);
		},
	},
	{
		accessorKey: "name",
		size: 300,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Name</p>
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
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		id: "assignedMembersCount",
		accessorFn: (row) => row.assignedMembers.length,
		size: 120,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Members</p>
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
			return (
				<div className="font-medium">
					{row.getValue("assignedMembersCount")}
				</div>
			);
		},
	},
	{
		accessorKey: "scanLimit",
		size: 120,
		header: "Scan Limit",
		cell: ({ row }) => {
      const original = row.original as BaseLocation;
      return (
        <div className="font-medium">
          {original.isUnlimited ? "Unlimited" : (original.scanLimit ?? "N/A")}
        </div>
      );
		},
	},
	{
		id: "actions",
		size: 100,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const _location = row.original;
			return (
				<div className="flex justify-center">
					<LocationActionsMenu location={_location} />
				</div>
			);
		},
	},
];
