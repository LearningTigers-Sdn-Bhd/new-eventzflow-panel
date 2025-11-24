"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { LocationActionsMenu } from "./action-menu";

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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Location ID</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
			const { copyToClipboard } = useCopyToClipboard({
				successMessage: "Location ID copied to clipboard",
			});

			return (
				<div className="flex items-center gap-2 text-center font-medium">
					<p className="truncate">{row.getValue("id")}</p>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-none hover:border"
						onClick={() => copyToClipboard(row.getValue("id"))}
					>
						<Copy className="size-4" />
					</Button>
				</div>
			);
		},
	},
	{
		accessorKey: "name",
		size: 300,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Location</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
			const location = row.original as BaseLocation;
			
			return (
				<div className="font-medium">
					{location.name}
				</div>
			);
		},
	},
	{
		accessorKey: "floor",
		size: 100,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Floor</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
			const floor = row.getValue("floor") as string | undefined | null;
			return (
				<div className="font-medium">
					{floor || "-"}
				</div>
			);
		},
	},
	{
		id: "staffCount",
		accessorFn: (row) => row.staffMembers?.length || 0,
		size: 100,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Staff</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Vendors</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none hover:border"
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
