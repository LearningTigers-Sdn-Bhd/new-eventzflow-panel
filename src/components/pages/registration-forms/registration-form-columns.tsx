"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { RegistrationForm } from "@/lib/api/registration-form";
import { RegistrationFormActionsMenu } from "./registration-form-action-menu";

const columns: ColumnDef<RegistrationForm>[] = [
	{
		accessorKey: "name",
		size: 200,
		header: ({ column }) => <SortableHeader column={column} label="Name" />,
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "slug",
		size: 150,
		header: () => <p className="font-medium">Slug</p>,
		cell: ({ row }) => (
			<code className="text-muted-foreground text-sm">
				{row.getValue("slug")}
			</code>
		),
	},
	{
		id: "ticketTypes",
		accessorFn: (row) => row.ticketTypes.map((tt) => tt.name).join(", "),
		size: 250,
		filterFn: (row, _columnId, filterValue) => {
			if (!filterValue) return true;

			const hasTicketTypes = row.original.ticketTypes.length > 0;
			if (filterValue === "mapped") return hasTicketTypes;
			if (filterValue === "unmapped") return !hasTicketTypes;

			return true;
		},
		header: () => <p className="font-medium">Ticket Types</p>,
		cell: ({ row }) => {
			const ticketTypes = row.original.ticketTypes;
			if (!ticketTypes.length) {
				return (
					<span className="text-muted-foreground text-sm">No ticket types</span>
				);
			}
			return (
				<div className="flex flex-wrap gap-1">
					{ticketTypes.map((tt) => (
						<Badge key={tt.id} variant="secondary" className="rounded-none">
							{tt.name}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Status" />,
		cell: ({ row }) => {
			const status = row.getValue("status") as number;
			if (status === 0) {
				return (
					<Badge className="rounded-none bg-green-600 hover:bg-green-600">
						Active
					</Badge>
				);
			}
			if (status === 1) {
				return (
					<Badge className="rounded-none bg-amber-500 hover:bg-amber-500">
						Waiting List
					</Badge>
				);
			}
			return (
				<Badge variant="secondary" className="rounded-none">
					Closed
				</Badge>
			);
		},
	},
	{
		accessorKey: "position",
		size: 100,
		header: ({ column }) => <SortableHeader column={column} label="Position" />,
		cell: ({ row }) => <div>{row.getValue("position") ?? "-"}</div>,
	},
	{
		id: "actions",
		size: 120,
		enableHiding: false,
		meta: {
			sticky: "right",
		},
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<RegistrationFormActionsMenu registrationForm={row.original} />
			</div>
		),
	},
];

export function generateColumns(): ColumnDef<RegistrationForm>[] {
	return columns;
}
