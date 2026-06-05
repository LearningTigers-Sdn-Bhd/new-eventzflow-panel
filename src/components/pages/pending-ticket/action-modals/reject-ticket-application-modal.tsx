"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useDialog } from "@/hooks/use-dialog";
import { rejectTicketApplication } from "@/lib/api/event/pending";
import type { PendingTicket } from "../pending-ticket-table-columns";

interface RejectTicketApplicationModalProps {
	ticket: PendingTicket;
}

export default function RejectTicketApplicationModal({
	ticket,
}: RejectTicketApplicationModalProps) {
	const params = useParams();
	const eventId = params.event_id as string;
	const { closeDialog } = useDialog();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (reason?: string) =>
			rejectTicketApplication({
				eventId,
				ticketId: ticket.publicId,
				reason,
			}),
		onSuccess: () => {
			toast.success("Application rejected");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "pending-tickets"],
			});
			closeDialog();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to reject application");
		},
	});

	const form = useForm({
		defaultValues: {
			reason: "",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value.reason.trim() || undefined);
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-6"
		>
			<FieldGroup>
				<form.Field name="reason">
					{(field) => (
						<InputLabel
							label="Reason (optional)"
							htmlFor="rejection-reason"
							value={field.state.value}
							onChange={field.handleChange}
							onBlur={field.handleBlur}
							placeholder="Due to limited seats"
							disabled={mutation.isPending}
							description="This reason is saved with the application review record."
						/>
					)}
				</form.Field>
			</FieldGroup>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={closeDialog}
					disabled={mutation.isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="rounded-none"
					disabled={mutation.isPending}
				>
					{mutation.isPending ? "Rejecting..." : "Reject Application"}
				</Button>
			</div>
		</form>
	);
}
