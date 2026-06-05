"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { EventSponsorshipTier } from "@/lib/api/sponsorship/response";
import { TierActionMenu } from "./tier-action-menu";

export const generateColumns = (): ColumnDef<EventSponsorshipTier>[] => {
	return [
		{
			accessorKey: "sort_order",
			header: "Sort",
			cell: ({ row }) => (
				<span className="font-mono text-muted-foreground text-xs">
					{row.original.sort_order || "-"}
				</span>
			),
		},
		{
			accessorKey: "name",
			header: "Tier Name",
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
		{
			id: "price",
			header: "Suggested Value",
			cell: ({ row }) => {
				const price = Number.parseFloat(row.original.suggested_value || "0");
				return (
					<span className="font-medium">
						{row.original.currency_default} {price.toLocaleString()}
					</span>
				);
			},
		},
		{
			accessorKey: "capacity",
			header: "Capacity",
			cell: ({ row }) => row.original.capacity || "Unlimited",
		},
		{
			accessorKey: "sponsorship_type_default",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="outline" className="capitalize">
					{row.original.sponsorship_type_default.replace("_", " ")}
				</Badge>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => <TierActionMenu tier={row.original} />,
		},
	];
};
