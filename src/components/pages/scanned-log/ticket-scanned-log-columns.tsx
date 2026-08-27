"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { ScannedLog } from "@/lib/api/event/scan-log/response";

const SOURCE_LABELS: Record<ScannedLog["source"], string> = {
	staff_scan: "Staff scan",
	self_check_in: "Self check-in",
	kiosk: "Kiosk",
};

export const columns: ColumnDef<ScannedLog>[] = [
	{
		accessorKey: "name",
		size: 250,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => {
			const scannedLog = row.original;
			return (
				<div className="flex flex-col gap-1">
					<h3 className="font-medium">{scannedLog.name}</h3>
					<p className="text-muted-foreground text-sm">{scannedLog.email}</p>
				</div>
			);
		},
	},
	{
		accessorKey: "scannableType",
		size: 110,
		header: ({ column }) => <SortableHeader column={column} label="Type" />,
		cell: ({ row }) => (
			<Badge variant="outline">{row.original.scannableType}</Badge>
		),
	},
	{
		id: "locationName",
		accessorFn: (row) => row.locationName,
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Location" />,
		cell: ({ row }) => {
			return <div className="font-medium">{row.getValue("locationName")}</div>;
		},
	},
	{
		accessorKey: "scannedBy",
		size: 220,
		header: ({ column }) => (
			<SortableHeader column={column} label="Scanned By" />
		),
		cell: ({ row }) => {
			return <div className="font-medium">{row.getValue("scannedBy")}</div>;
		},
	},
	{
		accessorKey: "source",
		size: 140,
		header: ({ column }) => <SortableHeader column={column} label="Source" />,
		cell: ({ row }) => (
			<Badge variant="outline">{SOURCE_LABELS[row.original.source]}</Badge>
		),
	},
	{
		accessorKey: "scannedAt",
		size: 200,
		header: ({ column }) => (
			<SortableHeader column={column} label="Scanned At" />
		),
		cell: ({ row }) => {
			const scannedAt = row.getValue("scannedAt") as string;
			return (
				<div className="font-medium">
					{new Date(scannedAt).toLocaleString()}
				</div>
			);
		},
	},
];
