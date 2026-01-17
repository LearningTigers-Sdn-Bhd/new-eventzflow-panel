"use client";

import { Gift } from "lucide-react";
import type { RouletteSession } from "@/lib/api/roulette/response";
import { DrawSessionTable } from "../shared/components/draw-session-table";
import { generateColumns, SessionItem } from "./session-config";

interface DataTableProps {
	data: RouletteSession[];
}

export function DataTable({ data }: DataTableProps) {
	return (
		<DrawSessionTable
			data={data}
			generateColumns={generateColumns}
			emptyStateConfig={{
				title: "No roulette sessions found",
				description: "Create your first prize roulette session to get started",
				icon: <Gift />,
			}}
			SessionItemComponent={SessionItem}
		/>
	);
}
