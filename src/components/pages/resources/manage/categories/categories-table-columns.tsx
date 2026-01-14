"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import { CategoriesActionMenu } from "./categories-action-menu";

export const columns: ColumnDef<ResourceCategory>[] = [
	{
		id: "index",
		header: "No.",
		size: 50,
		cell: ({ row }) => <div>{row.index + 1}</div>,
	},
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => (
			<span className="font-medium">{row.getValue("name")}</span>
		),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => (
			<div className="max-w-[300px] truncate text-muted-foreground">
				{row.getValue("description") || "-"}
			</div>
		),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<SortableHeader column={column} label="Created At" />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return <div>{date.toLocaleDateString()}</div>;
		},
	},
	{
		id: "actions",
		size: 120,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<CategoriesActionMenu category={row.original} />
			</div>
		),
	},
];
