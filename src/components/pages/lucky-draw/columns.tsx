"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getLuckyDrawSessionLogoUrl } from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { ActionMenu } from "./action-menu";

export const columns: ColumnDef<LuckyDrawSession>[] = [
	{
		accessorKey: "logo",
		header: "Logo",
		cell: ({ row }) => {
			const logo = row.getValue("logo") as string;
			return logo ? (
				<div className="relative h-10 w-10 overflow-hidden rounded-md border">
					<img
						src={getLuckyDrawSessionLogoUrl(logo)}
						alt={row.original.title}
						className="h-full w-full object-cover"
					/>
				</div>
			) : (
				<div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-muted-foreground text-xs">
					NA
				</div>
			);
		},
	},
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "draw_date",
		header: "Draw Date",
		cell: ({ row }) => {
			const date = row.getValue("draw_date") as string;
			return date ? format(new Date(date), "PPP") : "No date";
		},
	},
	{
		accessorKey: "draw_style",
		header: "Style",
		cell: ({ row }) => (
			<Badge variant="outline" className="capitalize">
				{row.getValue("draw_style")}
			</Badge>
		),
	},
	{
		accessorKey: "use_gifts",
		header: "Uses Gifts",
		cell: ({ row }) =>
			row.getValue("use_gifts") ? (
				<Badge>Yes</Badge>
			) : (
				<Badge variant="secondary">No</Badge>
			),
	},
	{
		id: "actions",
		cell: ({ row }) => <ActionMenu session={row.original} />,
	},
];
