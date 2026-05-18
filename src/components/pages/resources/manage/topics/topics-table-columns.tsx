"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { IconViewer } from "@/components/admin-ui/form/icon-viewer";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { TopicsActionMenu } from "./topics-action-menu";

export const columns: ColumnDef<ResourceTopic>[] = [
	{
		id: "index",
		header: "No.",
		size: 50,
		cell: ({ row }) => <div>{row.index + 1}</div>,
	},
	{
		accessorKey: "logo",
		header: "Icon",
		size: 50,
		cell: ({ row }) => <IconViewer name={row.getValue("logo")} />,
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
				<TopicsActionMenu topic={row.original} />
			</div>
		),
	},
];
