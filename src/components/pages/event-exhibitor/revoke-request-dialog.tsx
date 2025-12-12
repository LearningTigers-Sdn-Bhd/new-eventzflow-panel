"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { CustomRequestWithVendor } from "./custom-requests-columns";

interface RevokeRequestDialogProps {
	request: CustomRequestWithVendor;
	eventId: number;
	exhibitorKitId: number;
}

export function RevokeRequestDialog({
	request,
	eventId,
	exhibitorKitId,
}: RevokeRequestDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);

	const mutation = useMutation({
		mutationFn: async () => {
			return updateExhibitorKit(eventId, exhibitorKitId, {
				custom_requests_attributes: [
					{
						id: request.id,
						description: request.description,
						quantity: request.quantity,
						status: "pending",
						resolved_price: 0,
						response_notes: "",
					},
				],
			});
		},
		onSuccess: () => {
			toast.success("Request revoked and set back to pending");
			setOpen(false);
			// Invalidate both query keys to ensure real-time updates
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "vendors"],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to revoke request");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5 rounded-none">
					<Undo2 className="h-3.5 w-3.5" />
					Revoke
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Revoke to Pending?</DialogTitle>
					<DialogDescription>
						This will revert the request back to pending status and clear the price and notes so you can review it again.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2 rounded border bg-muted/30 p-3">
					<p className="font-medium text-sm">Request Details</p>
					<p className="text-sm">{request.description}</p>
					<p className="text-muted-foreground text-xs">
						From: {request.vendor_name} | Qty: {request.quantity} | Status:{" "}
						<span
							className={
								request.status === "approved"
									? "text-green-600"
									: "text-red-600"
							}
						>
							{request.status}
						</span>
					</p>
					{request.resolved_price !== null &&
						request.resolved_price !== undefined && (
							<p className="text-muted-foreground text-xs">
								Price:{" "}
								{new Intl.NumberFormat("en-MY", {
									style: "currency",
									currency: "MYR",
								}).format(request.resolved_price)}
							</p>
						)}
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="ghost"
						onClick={() => setOpen(false)}
						disabled={mutation.isPending}
						className="rounded-none"
					>
						Cancel
					</Button>
					<Button
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending}
						className="rounded-none bg-yellow-600 hover:bg-yellow-700"
					>
						{mutation.isPending ? "Revoking..." : "Revoke to Pending"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
