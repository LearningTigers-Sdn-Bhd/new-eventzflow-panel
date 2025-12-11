"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Package, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";
import { updateExhibitorKit, getExhibitorKits } from "@/lib/api/exhibitor-kit";

interface ReviewSubmitModalProps {
	eventId: number;
	eventVendorId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ReviewSubmitModal({
	eventId,
	eventVendorId,
	open,
	onOpenChange,
}: ReviewSubmitModalProps) {
	const router = useRouter();
	const { items, printings, getTotalAmount, clearCart } = useExhibitorCart();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalAmount = getTotalAmount();

	// Fetch exhibitor kits to find the one for this vendor
	const { data: exhibitorKits, isLoading: isLoadingKit } = useQuery({
		queryKey: ["exhibitor-kits", eventId],
		queryFn: () => getExhibitorKits(eventId),
		enabled: open, // Only fetch when modal is open
	});

	const exhibitorKit = exhibitorKits?.find((kit) => kit.event_vendor_id === eventVendorId);
	const exhibitorKitId = exhibitorKit?.id;

	const submitMutation = useMutation({
		mutationFn: async () => {
			if (!exhibitorKitId) {
				throw new Error("Exhibitor kit not found. Please contact support.");
			}

			// Prepare nested attributes payload to UPDATE existing kit
			const payload = {
				exhibitor_kit_items_attributes: items.map((item) => ({
					rentable_item_id: item.rentableItemId,
					quantity: item.quantity,
					agreed_price: item.agreedPrice,
				})),
				exhibitor_kit_printings_attributes: printings.map((printing) => ({
					printing_service_id: printing.printingServiceId,
					quantity: printing.quantity,
					agreed_price: printing.agreedPrice,
				})),
			};

			return updateExhibitorKit(eventId, exhibitorKitId, payload);
		},
		onSuccess: () => {
			toast.success("Order submitted successfully!");
			clearCart();
			onOpenChange(false);
			// Redirect to vendor profile or kit details
			router.push(`/event/${eventId}/vendors`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit order");
			setIsSubmitting(false);
		},
	});

	const handleSubmit = () => {
		if (items.length === 0 && printings.length === 0) {
			toast.error("Please add at least one item or printing service to your cart");
			return;
		}

		setIsSubmitting(true);
		submitMutation.mutate();
	};

	if (isLoadingKit) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl rounded-none">
					<DialogHeader>
						<DialogTitle>Review & Submit Order</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-8">
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-20 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!exhibitorKitId) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-2xl rounded-none">
					<DialogHeader>
						<DialogTitle>Error</DialogTitle>
					</DialogHeader>
					<div className="py-8 text-center">
						<p className="text-muted-foreground">
							Exhibitor kit not found. Please contact support.
						</p>
					</div>
					<DialogFooter>
						<Button onClick={() => onOpenChange(false)} className="rounded-none">
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl rounded-none">
				<DialogHeader>
					<DialogTitle>Review & Submit Order</DialogTitle>
					<DialogDescription>
						Review your order details before submitting
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh]">
					<div className="space-y-4 pr-4">
						{/* Items Summary */}
						{items.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 font-medium text-sm">
									<Package className="h-4 w-4" />
									Rentable Items ({items.length})
								</div>
								<div className="space-y-2">
									{items.map((item, index) => (
										<div
											key={index}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div className="flex-1">
												<p className="font-medium text-sm">{item.name}</p>
												<p className="text-muted-foreground text-xs">
													{item.quantity} {item.unitOfMeasure} × RM{" "}
													{item.agreedPrice.toFixed(2)}
												</p>
											</div>
											<p className="font-semibold text-sm">
												RM {(item.quantity * item.agreedPrice).toFixed(2)}
											</p>
										</div>
									))}
								
								</div>
							</div>
						)}

						{/* Printings Summary */}
						{printings.length > 0 && (
							<div className="space-y-3">
								<div className="flex items-center gap-2 font-medium text-sm">
									<ShoppingCart className="h-4 w-4" />
									Printing Services ({printings.length})
								</div>
								<div className="space-y-2">
									{printings.map((printing, index) => (
										<div
											key={index}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div className="flex-1">
												<p className="font-medium text-sm">{printing.name}</p>
												<p className="text-muted-foreground text-xs">
													{printing.quantity} {printing.unitOfMeasure} × RM{" "}
													{printing.agreedPrice.toFixed(2)}
												</p>
											</div>
											<p className="font-semibold text-sm">
												RM {(printing.quantity * printing.agreedPrice).toFixed(2)}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						<Separator />

						{/* Total Amount */}
						<div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
							<p className="font-semibold">Total Amount</p>
							<p className="font-bold text-xl">RM {totalAmount.toFixed(2)}</p>
						</div>
					</div>
				</ScrollArea>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
						className="rounded-none
">
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting || (items.length === 0 && printings.length === 0)}
						className="gap-2 rounded-none"
					>
						{isSubmitting ? (
							"Submitting..."
						) : (
							<>
								<CheckCircle2 className="h-4 w-4" />
								Submit Order
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
