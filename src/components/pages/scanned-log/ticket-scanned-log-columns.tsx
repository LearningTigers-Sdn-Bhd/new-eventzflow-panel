"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { ScannedLog } from "@/lib/api/event/scan-log/response";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<ScannedLog["source"], string> = {
	staff_scan: "Staff scan",
	self_check_in: "Self check-in",
	kiosk: "Public Check-in Page",
};

// Matches the bg-{color}-100/text-{color}-800 badge convention used for
// status columns throughout the panel (e.g. ticket status, payment status).
const SOURCE_BADGE_CLASSES: Record<ScannedLog["source"], string> = {
	staff_scan: "bg-green-100 text-green-800 hover:bg-green-100",
	self_check_in: "bg-blue-100 text-blue-800 hover:bg-blue-100",
	kiosk: "bg-amber-100 text-amber-800 hover:bg-amber-100",
};

const TYPE_BADGE_CLASSES: Record<ScannedLog["scannableType"], string> = {
	Ticket: "bg-blue-100 text-blue-800 hover:bg-blue-100",
	Visitor: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
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
			<Badge
				className={cn(
					TYPE_BADGE_CLASSES[row.original.scannableType],
					"rounded-none",
				)}
			>
				{row.original.scannableType}
			</Badge>
		),
	},
	{
		id: "ticketTypeName",
		accessorFn: (row) => row.ticketTypeName,
		size: 160,
		header: ({ column }) => (
			<SortableHeader column={column} label="Ticket Type" />
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.original.ticketTypeName ?? "—"}</div>
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
			<Badge
				className={cn(
					SOURCE_BADGE_CLASSES[row.original.source],
					"rounded-none",
				)}
			>
				{SOURCE_LABELS[row.original.source]}
			</Badge>
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
