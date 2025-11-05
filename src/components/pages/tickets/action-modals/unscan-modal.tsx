"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { unscanTicket } from "@/lib/api/ticket";
import { toast } from "sonner";
import type { BaseTicket } from "../columns";

interface UnscanModalProps {
	ticket: BaseTicket;
}

export default function UnscanModal({ ticket }: UnscanModalProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const params = useParams();
	const eventId = params.event_id as string;

	const unscanMutation = useMutation({
		mutationFn: () => unscanTicket(ticket.id),
		onSuccess: () => {
			toast.success("Ticket unscanned successfully", {
				description: `${ticket.name}'s ticket has been reset to not scanned.`,
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error("Failed to unscan ticket", {
				description: error.message || "An error occurred while unscanning the ticket.",
			});
		},
	});

	const handleUnscan = () => {
		unscanMutation.mutate();
	};

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
				<AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
				<div className="space-y-1">
					<p className="font-medium text-amber-900 text-sm dark:text-amber-100">
						Warning: This action will reset the ticket status
					</p>
					<p className="text-amber-800 text-xs dark:text-amber-200">
						This will set the ticket back to "Not Scanned" and clear all check-in information.
					</p>
				</div>
			</div>

			<div className="space-y-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
				<h4 className="font-medium text-sm">Ticket Information</h4>
				<div className="space-y-1 text-sm">
					<p>
						<span className="text-muted-foreground">Name:</span>{" "}
						<span className="font-medium">{ticket.name}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Email:</span>{" "}
						<span className="font-medium">{ticket.email || "N/A"}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Phone:</span>{" "}
						<span className="font-medium">{ticket.phone || "N/A"}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Ticket Type:</span>{" "}
						<span className="font-medium">{ticket.ticketTypeName || "N/A"}</span>
					</p>
					<p>
						<span className="text-muted-foreground">Ticket ID:</span>{" "}
						<span className="font-medium">{ticket.publicId}</span>
					</p>
					{ticket.checkInAt && (
						<p>
							<span className="text-muted-foreground">Checked in at:</span>{" "}
							<span className="font-medium">
								{new Date(ticket.checkInAt).toLocaleString()}
							</span>
						</p>
					)}
				</div>
			</div>

			<p className="text-muted-foreground text-sm">
				Are you sure you want to unscan this ticket?
			</p>

			<div className="flex justify-end gap-2 pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					disabled={unscanMutation.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={handleUnscan}
					disabled={unscanMutation.isPending}
					className="rounded-none"
				>
					{unscanMutation.isPending ? "Unscanning..." : "Unscan Ticket"}
				</Button>
			</div>
		</div>
	);
}
