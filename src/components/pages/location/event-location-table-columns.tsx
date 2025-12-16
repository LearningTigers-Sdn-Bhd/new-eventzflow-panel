"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CopyCell } from "@/components/admin-ui/table/cell/copy-cell";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { LocationActionsMenu } from "./event-location-action-menu";

export type LocationDetails = {
	notes?: string;
	[key: string]: string | undefined;
};

export type LocationMember = {
	id: string;
	name: string;
	email: string;
	role: string;
	memberType: "staff" | "vendor";
};

export type BaseLocation = {
	id: string;
	name: string;
	scanLimit: number | null;
	isUnlimited?: boolean;
	floor?: string | null;
	locationDetails?: LocationDetails;
	locationDisplayName?: string;
	staffMembers?: LocationMember[];
	vendors?: LocationMember[];
	assignedMembers: LocationMember[];
};

export const columns: ColumnDef<BaseLocation>[] = [
	{
		accessorKey: "id",
		size: 140,
		header: ({ column }) => (
			<SortableHeader column={column} label="Location ID" />
		),
		cell: ({ row }) => (
			<CopyCell
				value={row.getValue("id")}
				successMessage="Location ID copied to clipboard"
			/>
		),
	},
	{
		accessorKey: "name",
		size: 300,
		header: ({ column }) => <SortableHeader column={column} label="Location" />,
		cell: ({ row }) => {
			const location = row.original as BaseLocation;

			return <div className="font-medium">{location.name}</div>;
		},
	},
	{
		accessorKey: "floor",
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Floor" />,
		cell: ({ row }) => {
			const floor = row.getValue("floor") as string | undefined | null;
			return <div className="font-medium">{floor || "-"}</div>;
		},
	},
	{
		id: "staffCount",
		accessorFn: (row) => row.staffMembers?.length || 0,
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Staff" />,
		cell: ({ row }) => {
			const count = row.getValue("staffCount") as number;
			return (
				<div className="flex items-center justify-center">
					<span className="font-medium">{count}</span>
				</div>
			);
		},
	},
	{
		id: "vendorCount",
		accessorFn: (row) => row.vendors?.length || 0,
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Vendors" />,
		cell: ({ row }) => {
			const count = row.getValue("vendorCount") as number;
			return (
				<div className="flex items-center justify-center">
					<span className="font-medium">{count}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "scanLimit",
		size: 120,
		header: "Scan Limit",
		cell: ({ row }) => {
			const original = row.original as BaseLocation;
			return (
				<div className="font-medium">
					{original.isUnlimited ? "Unlimited" : (original.scanLimit ?? "N/A")}
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 100,
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => {
			const _location = row.original;
			return (
				<div className="flex justify-center">
					<LocationActionsMenu location={_location} />
				</div>
			);
		},
	},
];
