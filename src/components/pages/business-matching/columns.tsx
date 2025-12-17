"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { BusinessMatchingEvent } from "@/lib/api/business-matching";
import { useDialog } from "@/hooks/use-dialog";
import AvailabilityDialog from "./availability-dialog";
import BookingsDialog from "./bookings-dialog";

export const columns: ColumnDef<BusinessMatchingEvent>[] = [
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "duration",
		header: "Duration",
	},
	{
		accessorKey: "location",
		header: "Location",
	},
	{
		accessorKey: "admin_email",
		header: "Host Email",
	},
	{
		accessorKey: "admin_wa_number",
		header: "Host Phone",
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			
			return (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							openDialog({
								component: AvailabilityDialog,
								props: {
									bmEventId: row.original.id,
									eventId: row.original.event_id,
									eventTitle: row.original.title,
								},
								config: {
									title: `${row.original.title}`,
									size: "3xl",
								},
							});
						}}
					>
						View Availability
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							openDialog({
								component: BookingsDialog,
								props: {
									bmEventId: row.original.id,
									eventId: row.original.event_id,
								},
								config: {
									title: `Bookings for ${row.original.title}`,
									size: "4xl",
								},
							});
						}}
					>
						View Bookings
					</Button>
				</div>
			);
		},
	},
];
