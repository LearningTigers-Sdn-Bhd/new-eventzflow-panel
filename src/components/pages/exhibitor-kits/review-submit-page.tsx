"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Package, ShoppingCart, Users, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";
import { createExhibitorKit } from "@/lib/api/exhibitor-kit";

interface ReviewSubmitPageProps {
	eventId: number;
	eventVendorId: number;
}

export function ReviewSubmitPage({ eventId, eventVendorId }: ReviewSubmitPageProps) {
	const router = useRouter();
	const { items, printings, getTotalAmount, clearCart } = useExhibitorCart();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalAmount = getTotalAmount();

	const submitMutation = useMutation({
		mutationFn: async () => {
			// Prepare nested attributes payload
			const payload = {
				event_vendor_id: eventVendorId,
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

			return createExhibitorKit(eventId, payload);
		},
		onSuccess: (data) => {
			toast.success("Exhibitor kit submitted successfully!");
			clearCart();
			// Redirect to kit details or vendor profile
			router.push(`/event/${eventId}/vendors`);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit exhibitor kit");
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

	return (
		<div className="space-y-6 px-2 py-6 md:px-4">
			<div className="space-y-2">
				<h2 className="font-semibold text-2xl">Review & Submit Order</h2>
				<p className="text-muted-foreground">
					Review your order details before submitting
				</p>
			</div>

			{/* Items Summary */}
			{items.length > 0 && (
				<Card className="rounded-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Package className="h-5 w-5" />
							Rentable Items ({items.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{items.map((item, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex-1">
										<p className="font-medium">{item.name}</p>
										<p className="text-muted-foreground text-sm">
											{item.quantity} {item.unitOfMeasure} × RM {item.agreedPrice.toFixed(2)}
										</p>
									</div>
									<p className="font-semibold">
										RM {(item.quantity * item.agreedPrice).toFixed(2)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Printings Summary */}
			{printings.length > 0 && (
				<Card className="rounded-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingCart className="h-5 w-5" />
							Printing Services ({printings.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{printings.map((printing, index) => (
								<div key={index} className="flex items-center justify-between">
									<div className="flex-1">
										<p className="font-medium">{printing.name}</p>
										<p className="text-muted-foreground text-sm">
											{printing.quantity} {printing.unitOfMeasure} × RM {printing.agreedPrice.toFixed(2)}
										</p>
									</div>
									<p className="font-semibold">
										RM {(printing.quantity * printing.agreedPrice).toFixed(2)}
									</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Empty State */}
			{items.length === 0 && printings.length === 0 && (
				<Card className="rounded-none">
					<CardContent className="flex flex-col items-center justify-center py-12">
						<ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
						<p className="mb-2 font-medium">Your cart is empty</p>
						<p className="mb-4 text-center text-muted-foreground text-sm">
							Add items or printing services to your cart before submitting
						</p>
						<Button
							onClick={() => router.push(`/event/${eventId}/my-exhibitor-kit/order-items` as any)}
							variant="outline"
							className="rounded-none"
						>
							Browse Items
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Total Amount */}
			{(items.length > 0 || printings.length > 0) && (
				<Card className="rounded-none border-primary">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<p className="font-semibold text-lg">Total Amount</p>
							<p className="font-bold text-2xl">RM {totalAmount.toFixed(2)}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Action Buttons */}
			<div className="flex gap-3">
				<Button
					onClick={() => router.back()}
					variant="outline"
					className="flex-1 rounded-none"
					disabled={isSubmitting}
				>
					Back
				</Button>
				<Button
					onClick={handleSubmit}
					className="flex-1 gap-2 rounded-none"
					disabled={isSubmitting || (items.length === 0 && printings.length === 0)}
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
			</div>
		</div>
	);
}
