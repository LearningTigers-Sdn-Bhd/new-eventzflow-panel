"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/api/plan";
import { PlanCreatedAt } from "./plan-created-at";
import { PlanDeleteDialog } from "./plan-delete-dialog";

interface ColumnActions {
	eventId: string;
	onDelete: (planId: number) => void;
	isDeleting: boolean;
}

export function generatePlanColumns({
	eventId,
	onDelete,
	isDeleting,
}: ColumnActions): ColumnDef<Plan>[] {
	return [
		{
			accessorKey: "name",
			header: "Plan Name",
		},
		{
			accessorKey: "tables_count",
			header: "Tables",
			cell: ({ row }) => row.original.tables_count || 0,
		},
		{
			id: "assigned",
			header: "Assigned",
			accessorFn: (row) => row.assigned_guests_count || 0,
			cell: ({ row }) =>
				`${row.original.assigned_guests_count || 0} / ${row.original.total_capacity || 0}`,
		},
		{
			accessorKey: "created_at",
			header: "Created At",
			cell: ({ row }) => <PlanCreatedAt createdAt={row.original.created_at} />,
		},
		{
			id: "actions",
			header: "Actions",
			enableSorting: false,
			enableHiding: false,
			cell: ({ row }) => {
				const plan = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							className="rounded-none"
							asChild
						>
							<Link href={`/event/${eventId}/plans/${plan.id}`} target="_blank">
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Link>
						</Button>
						<PlanDeleteDialog
							plan={plan}
							onDelete={onDelete}
							isDeleting={isDeleting}
						/>
					</div>
				);
			},
		},
	];
}
