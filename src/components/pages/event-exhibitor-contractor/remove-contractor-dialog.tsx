"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { AlertTriangle, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";

interface TransactionDetails {
	rentable_items_in_use: number;
	printing_services_in_use: number;
}

interface RemoveContractorDialogProps {
	eventId: number;
	contractorName: string;
	onClose?: () => void;
}

export function RemoveContractorDialog({
	eventId,
	contractorName,
	onClose,
}: RemoveContractorDialogProps) {
	const queryClient = useQueryClient();
	const [hasTransactions, setHasTransactions] = useState(false);
	const [transactionDetails, setTransactionDetails] =
		useState<TransactionDetails | null>(null);

	// Remove contractor mutation
	const removeMutation = useMutation({
		mutationFn: () => removeEventExhibitionContractor(eventId),
		onSuccess: () => {
			toast.success("Main contractor removed successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "exhibition-contractor"],
			});
			onClose?.();
		},
		onError: async (error: Error) => {
			// Check if this is a HAS_TRANSACTIONS error
			if (error instanceof HTTPError && error.response.status === 422) {
				try {
					const errorBody = (await error.response.json()) as {
						code?: string;
						details?: TransactionDetails;
					};
					if (errorBody.code === "HAS_TRANSACTIONS") {
						setHasTransactions(true);
						setTransactionDetails(errorBody.details || null);
						return;
					}
				} catch {
					// If parsing fails, fall through to default error handling
				}
			}
			toast.error(error.message || "Failed to remove contractor");
		},
	});

	// Show transaction warning state
	if (hasTransactions) {
		return (
			<div className="space-y-4">
				<div className="flex items-start gap-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
						<ShoppingCart className="h-5 w-5 text-amber-500" />
					</div>
					<div className="space-y-2">
						<p className="font-medium text-sm">Cannot remove contractor</p>
						<p className="text-muted-foreground text-sm">
							Exhibitors have already made transactions for items or services
							from <strong>{contractorName}</strong>.
						</p>
						{transactionDetails && (
							<div className="mt-3 space-y-1 rounded-md bg-muted p-3 text-sm">
								{transactionDetails.rentable_items_in_use > 0 && (
									<p>
										<strong>{transactionDetails.rentable_items_in_use}</strong>{" "}
										rentable item(s) in use
									</p>
								)}
								{transactionDetails.printing_services_in_use > 0 && (
									<p>
										<strong>
											{transactionDetails.printing_services_in_use}
										</strong>{" "}
										printing service(s) in use
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-2 border-t pt-4">
					<Button variant="outline" onClick={onClose} className="rounded-none">
						Close
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-start gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle className="h-5 w-5 text-destructive" />
				</div>
				<div className="space-y-2">
					<p className="text-sm">
						Are you sure you want to remove <strong>{contractorName}</strong>{" "}
						from this event?
					</p>
					<p className="text-muted-foreground text-sm">
						This action will unassign the main contractor from this event. The
						exhibitor kit feature may also be disabled.
					</p>
				</div>
			</div>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button variant="outline" onClick={onClose} className="rounded-none">
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={() => removeMutation.mutate()}
					disabled={removeMutation.isPending}
					className="rounded-none"
				>
					{removeMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Remove Contractor
				</Button>
			</div>
		</div>
	);
}
