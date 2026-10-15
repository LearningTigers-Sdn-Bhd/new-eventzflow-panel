"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import type { VehicleRegistration } from "@/lib/api/vehicle-registration";
import { VehicleActionsMenu } from "./vehicle-actions-menu";
import { VehicleIssuesBadge } from "./vehicle-issues-badge";

export const ALL_GROUPS = "all";
export const ALL_ISSUES = "all";
export const ISSUES_ONLY = "issues";

export function generateColumns(
	eventId: string,
): ColumnDef<VehicleRegistration>[] {
	return [
		{
			accessorKey: "plate",
			size: 140,
			header: ({ column }) => <SortableHeader column={column} label="Plate" />,
			cell: ({ row }) => (
				<span className="whitespace-nowrap font-semibold">
					{row.getValue("plate")}
				</span>
			),
		},
		{
			id: "crewSearch",
			// Hidden search-only column: the control bar's selective search
			// matches plates and crew member names through this accessor.
			accessorFn: (vehicle) =>
				`${vehicle.plate} ${vehicle.crew.map((member) => member.name).join(" ")}`,
			enableHiding: false,
			enableSorting: false,
			meta: { hidden: true },
			header: () => null,
			cell: () => null,
		},
		{
			id: "group",
			// Hidden filter-only column: the group filter select sets this column's
			// filter to the registration form id (number, "all" clears it).
			accessorFn: (vehicle) => vehicle.registrationForm.id,
			enableHiding: false,
			enableSorting: false,
			filterFn: (row, columnId, filterValue) => {
				if (filterValue === ALL_GROUPS || filterValue == null) return true;
				return row.getValue(columnId) === filterValue;
			},
			meta: { hidden: true },
			header: () => null,
			cell: () => null,
		},
		{
			id: "issueCount",
			// Hidden filter-only column backing the issues select.
			accessorFn: (vehicle) => vehicle.issues.length,
			enableHiding: false,
			enableSorting: false,
			filterFn: (row, columnId, filterValue) => {
				if (filterValue === ISSUES_ONLY) {
					return (row.getValue(columnId) as number) > 0;
				}
				return true;
			},
			meta: { hidden: true },
			header: () => null,
			cell: () => null,
		},
		{
			id: "groupName",
			accessorFn: (vehicle) => vehicle.registrationForm.name ?? "",
			size: 160,
			header: "Group",
			cell: ({ row }) => (
				<span className="whitespace-nowrap">
					{row.original.registrationForm.name ?? "—"}
				</span>
			),
		},
		{
			id: "seats",
			accessorFn: (vehicle) => vehicle.seatsUsed,
			size: 90,
			header: "Seats",
			cell: ({ row }) => (
				<span className="whitespace-nowrap">
					{row.original.seatsUsed}/{row.original.capacity ?? "?"}
				</span>
			),
		},
		{
			id: "crew",
			// Summary only — full crew names/roles live in the detail sheet.
			accessorFn: (vehicle) => vehicle.crew.length,
			size: 110,
			enableSorting: false,
			header: "Crew",
			cell: ({ row }) => {
				const count = row.original.crew.length;
				if (count === 0) {
					return <span className="text-muted-foreground text-sm">No crew</span>;
				}
				return (
					<span className="inline-flex items-center gap-1.5 text-sm">
						<Users className="size-3.5 text-muted-foreground" />
						{count} {count === 1 ? "member" : "members"}
					</span>
				);
			},
		},
		{
			id: "issues",
			// Badge only — full issue messages live in the detail sheet.
			accessorFn: (vehicle) => vehicle.issues.length,
			size: 110,
			header: "Issues",
			cell: ({ row }) => <VehicleIssuesBadge issues={row.original.issues} />,
		},
		{
			id: "actions",
			size: 70,
			enableHiding: false,
			enableSorting: false,
			meta: { sticky: "right" },
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => (
				<div className="justify-end">
					<VehicleActionsMenu eventId={eventId} vehicle={row.original} />
				</div>
			),
		},
	];
}
