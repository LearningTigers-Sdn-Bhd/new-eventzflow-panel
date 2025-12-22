"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import type { BusinessMatchingEvent, BusinessHost } from "@/lib/api/business-matching";

import { useDialog } from "@/hooks/use-dialog";

import { useEventPermissions } from "@/hooks/use-event-permissions"; // Add this import

import AvailabilityDialog from "./availability-dialog";

import BookingsDialog from "./bookings-dialog";

import AttachHostDialog from "./attach-host-dialog";
import HostDetailsDialog from "./host-details-dialog"; // Import new dialog
import { Link as LinkIcon, Eye } from "lucide-react"; // Import Eye icon
import { toast } from "sonner";

export const columns: ColumnDef<BusinessMatchingEvent>[] = [
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "location",
		header: "Location",
        cell: ({ row }) => <span>{row.original.location}</span>, // Ensure plain text
	},
	{
		accessorKey: "host",
		header: "Host",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
            const { isBusinessHost, canManageEvent } = useEventPermissions(row.original.event_id);
            const host = row.original.host;

			if (!host) {
				return (
					<Button
						variant="outline"
						size="sm"
                        disabled={isBusinessHost && !canManageEvent} // Disable for hosts
						onClick={() => {
							openDialog({
								component: AttachHostDialog,
								props: { bmEvent: row.original },
								config: {
									title: `Attach Host to "${row.original.title}"`,
									size: "lg",
								},
							});
						}}
					>
						Attach a host
					</Button>
				);
			}

			return (
				<div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="font-medium">{host.full_name}</span>
                        <span className="text-xs text-muted-foreground">{host.phone || "No phone"}</span>
                    </div>
                    {(!isBusinessHost || canManageEvent) && ( // Hide View button for hosts
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                                openDialog({
                                    component: HostDetailsDialog,
                                    props: { 
                                        host, 
                                        bmEventId: row.original.id, 
                                        eventId: row.original.event_id 
                                    },
                                    config: {
                                        title: "Host Details",
                                        size: "md",
                                    },
                                });
                            }}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const { openDialog } = useDialog();
			
			return (
				<div className="flex flex-wrap gap-2">
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
									title: `Availability for ${row.original.title}`,
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
