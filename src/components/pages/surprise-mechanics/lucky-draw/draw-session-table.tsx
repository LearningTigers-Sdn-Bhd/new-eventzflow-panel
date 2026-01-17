"use client";

import { Gift } from "lucide-react";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { DrawSessionTable } from "../shared/components/draw-session-table";
import { generateColumns, SessionItem } from "./session-config";

interface DataTableProps {
	data: LuckyDrawSession[];
}

export function DataTable({ data }: DataTableProps) {
	return (
		<DrawSessionTable
			data={data}
			generateColumns={generateColumns}
			emptyStateConfig={{
				title: "No sessions found",
				description: "Create your first lucky draw session to get started",
				icon: <Gift />,
			}}
			SessionItemComponent={SessionItem}
		/>
	);
}
