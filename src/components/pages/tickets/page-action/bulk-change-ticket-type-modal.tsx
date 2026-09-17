"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDialog } from "@/hooks/use-dialog";
import { bulkUpdateTicketType } from "@/lib/api/ticket";
import { getEventTicketTypes } from "@/lib/api/ticket-type";

interface BulkChangeTicketTypeModalProps {
	eventId: string;
	publicIds: string[];
	onSuccess: () => void;
}

export default function BulkChangeTicketTypeModal({
	eventId,
	publicIds,
	onSuccess,
}: BulkChangeTicketTypeModalProps) {
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();
	const [ticketTypeId, setTicketTypeId] = useState<string>("");

	const { data: ticketTypes, isLoading: isLoadingTicketTypes } = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const bulkUpdateMutation = useMutation({
		mutationFn: () =>
			bulkUpdateTicketType(eventId, Number(ticketTypeId), publicIds),
		onSuccess: (result) => {
			if (result.errors.length > 0) {
				toast.warning(
					`Updated ${result.updated.length} ticket(s), ${result.errors.length} failed`,
				);
			} else {
				toast.success(`Updated ${result.updated.length} ticket(s)`);
			}
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "tickets"],
			});
			onSuccess();
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update ticket type");
		},
	});

	return (
		<div className="space-y-4">
			<p className="text-muted-foreground text-sm">
				Change the ticket type for {publicIds.length} selected ticket
				{publicIds.length === 1 ? "" : "s"}.
			</p>

			<Select value={ticketTypeId} onValueChange={setTicketTypeId}>
				<SelectTrigger className="w-full rounded-none">
					<SelectValue placeholder="Select ticket type" />
				</SelectTrigger>
				<SelectContent className="rounded-none">
					{ticketTypes?.map((type) => (
						<SelectItem
							key={type.id}
							value={String(type.id)}
							className="rounded-none"
						>
							{type.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<div className="flex justify-end gap-2 pt-4">
				<Button
					variant="outline"
					onClick={closeDialog}
					disabled={bulkUpdateMutation.isPending}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					onClick={() => bulkUpdateMutation.mutate()}
					disabled={
						!ticketTypeId ||
						isLoadingTicketTypes ||
						bulkUpdateMutation.isPending
					}
					className="rounded-none"
				>
					{bulkUpdateMutation.isPending ? "Updating..." : "Change Ticket Type"}
				</Button>
			</div>
		</div>
	);
}
