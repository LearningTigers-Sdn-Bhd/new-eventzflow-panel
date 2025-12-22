"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import type { Group } from "@/lib/api/group/response";
import { GroupActionsMenu } from "./action-menu";

export function generateColumns(): ColumnDef<Group>[] {
	return [
		{
			accessorKey: "name",
			size: 250,
			header: ({ column }) => <SortableHeader column={column} label="Name" />,
			cell: ({ row }) => (
				<div className="font-medium">{row.getValue("name")}</div>
			),
		},
		{
			accessorKey: "description",
			size: 350,
			header: "Description",
			cell: ({ row }) => (
				<div className="text-muted-foreground text-sm">
					{row.getValue("description") || "—"}
				</div>
			),
		},
		{
			accessorKey: "created_at",
			size: 150,
			header: ({ column }) => (
				<SortableHeader column={column} label="Created At" />
			),
			cell: ({ row }) => {
				const date = new Date(row.getValue("created_at"));
				const timePart = date.toLocaleString("en-US", { timeStyle: "medium" });
				const datePart = date.toLocaleString("en-US", { dateStyle: "medium" });
				return (
					<div className="font-medium">
						<div className="font-semibold">{timePart}</div>
						<div className="text-gray-500 text-sm">{datePart}</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			size: 160,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const group = row.original;
				return (
					<div className="flex justify-center">
						<GroupActionsMenu group={group} />
					</div>
				);
			},
		},
	];
}
