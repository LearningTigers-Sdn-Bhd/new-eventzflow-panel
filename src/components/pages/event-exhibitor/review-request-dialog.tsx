"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { CustomRequestWithVendor } from "./custom-requests-columns";

interface ReviewRequestDialogProps {
	request: CustomRequestWithVendor;
	eventId: number;
	exhibitorKitId: number;
}

export function ReviewRequestDialog({
	request,
	eventId,
	exhibitorKitId,
}: ReviewRequestDialogProps) {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [action, setAction] = useState<"approve" | "reject" | null>(null);
	const [price, setPrice] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const mutation = useMutation({
		mutationFn: async (data: {
			status: "approved" | "rejected";
			resolved_price?: number;
			response_notes?: string;
		}) => {
			return updateExhibitorKit(eventId, exhibitorKitId, {
				custom_requests_attributes: [
					{
						id: request.id,
						description: request.description,
						quantity: request.quantity,
						status: data.status,
						resolved_price: data.resolved_price,
						response_notes: data.response_notes,
					},
				],
			});
		},
		onSuccess: (_, variables) => {
			toast.success(
				`Request ${variables.status === "approved" ? "approved" : "rejected"} successfully`,
			);
			setOpen(false);
			setAction(null);
			setPrice("");
			setNotes("");
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "vendors"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update request");
		},
		onSettled: () => {
			setIsSubmitting(false);
		},
	});

	const handleApprove = () => {
		if (!price || Number.parseFloat(price) < 0) {
			toast.error("Please enter a valid price");
			return;
		}
		setIsSubmitting(true);
		mutation.mutate({
			status: "approved",
			resolved_price: Number.parseFloat(price),
			response_notes: notes || undefined,
		});
	};

	const handleReject = () => {
		if (!notes.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}
		setIsSubmitting(true);
		mutation.mutate({
			status: "rejected",
			response_notes: notes,
		});
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setAction(null);
			setPrice("");
			setNotes("");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="rounded-none">
					Review
				</Button>
			</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Review Custom Request</DialogTitle>
					<DialogDescription>
						Review and respond to this custom request from {request.vendor_name}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Request Details */}
					<div className="space-y-2 rounded border bg-muted/30 p-3">
						<p className="font-medium text-sm">Request Details</p>
						<p className="text-sm">{request.description}</p>
						<p className="text-muted-foreground text-xs">
							Quantity: {request.quantity}
						</p>
					</div>

					{/* Action Selection */}
					{!action && (
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1 gap-2 rounded-none border-green-500 text-green-600 hover:bg-green-50"
								onClick={() => setAction("approve")}
							>
								<CheckCircle2 className="h-4 w-4" />
								Approve
							</Button>
							<Button
								variant="outline"
								className="flex-1 gap-2 rounded-none border-red-500 text-red-600 hover:bg-red-50"
								onClick={() => setAction("reject")}
							>
								<XCircle className="h-4 w-4" />
								Reject
							</Button>
						</div>
					)}

					{/* Approve Form */}
					{action === "approve" && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="price">Price (RM) *</Label>
								<Input
									id="price"
									type="number"
									min="0"
									step="0.01"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									placeholder="Enter price per unit"
									className="rounded-none"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="notes">Notes (optional)</Label>
								<Textarea
									id="notes"
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Add any notes for the exhibitor..."
									className="rounded-none"
								/>
							</div>
						</div>
					)}

					{/* Reject Form */}
					{action === "reject" && (
						<div className="space-y-2">
							<Label htmlFor="reject-notes">Reason for Rejection *</Label>
							<Textarea
								id="reject-notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Explain why this request cannot be fulfilled..."
								className="min-h-[100px] rounded-none"
							/>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					{action && (
						<>
							<Button
								variant="ghost"
								onClick={() => setAction(null)}
								disabled={isSubmitting}
								className="rounded-none"
							>
								Back
							</Button>
							<Button
								onClick={action === "approve" ? handleApprove : handleReject}
								disabled={isSubmitting}
								className={`gap-2 rounded-none ${
									action === "approve"
										? "bg-green-600 hover:bg-green-700"
										: "bg-red-600 hover:bg-red-700"
								}`}
							>
								{isSubmitting
									? "Processing..."
									: action === "approve"
										? "Confirm Approval"
										: "Confirm Rejection"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
