"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConsumptionCharge } from "@/lib/api/credits";
import { cn } from "@/lib/utils";

export const consumptionColumns: ColumnDef<ConsumptionCharge>[] = [
	{
		accessorKey: "country",
		size: 400,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Country</p>
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
			return <div className="font-medium">{row.getValue("country")}</div>;
		},
	},
	{
		accessorKey: "countryCode",
		size: 200,
		header: () => {
			return <p className="text-center font-medium">Country Code</p>;
		},
		cell: ({ row }) => {
			return (
				<div className="text-center font-mono text-sm">
					{row.getValue("countryCode")}
				</div>
			);
		},
	},
	{
		accessorKey: "waMessageCredits",
		size: 200,
		header: () => {
			return <p className="text-center font-medium">WA Message Credits</p>;
		},
		cell: ({ row }) => {
			const credits = row.getValue("waMessageCredits") as number;
			return <div className="text-center font-semibold">{credits}</div>;
		},
	},
];
