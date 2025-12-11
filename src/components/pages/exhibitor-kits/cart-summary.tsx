"use client";

import { useState } from "react";
import { ShoppingCart, Trash2, Package, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";
import { ReviewSubmitModal } from "./review-submit-modal";
import { useCurrentUserEventVendorId } from "@/hooks/use-event-vendors";

interface CartSummaryProps {
	eventId: number;
	onCheckout?: () => void;
}

export function CartSummary({ eventId, onCheckout }: CartSummaryProps) {
	const [showReviewModal, setShowReviewModal] = useState(false);
	const { eventVendorId } = useCurrentUserEventVendorId(eventId);
	const {
		items,
		printings,
		updateItemQuantity,
		removeItem,
		updatePrintingQuantity,
		removePrinting,
		getTotalAmount,
		getItemsCount,
	} = useExhibitorCart();

	const totalAmount = getTotalAmount();
	const itemsCount = getItemsCount();

	if (itemsCount === 0) {
		return (
			<Card className="rounded-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Cart Summary
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="py-8 text-center">
						<ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
						<p className="mt-2 text-muted-foreground text-sm">
							Your cart is empty
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="rounded-none">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Cart Summary
					</span>
					<Badge variant="secondary" className="rounded-none">{itemsCount} items</Badge>
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Rentable Items */}
				{items.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<Package className="h-4 w-4" />
							Rentable Items
						</div>
						{items.map((item) => (
							<div
								key={item.rentableItemId}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								<div className="flex-1 space-y-1">
									<p className="font-medium text-sm">{item.name}</p>
									<p className="text-muted-foreground text-xs">
										RM {item.agreedPrice.toFixed(2)} per {item.unitOfMeasure}
									</p>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min="1"
											value={item.quantity}
											onChange={(e) =>
												updateItemQuantity(
													item.rentableItemId,
													Number.parseInt(e.target.value) || 1,
												)
											}
											className="h-7 w-20 rounded-none text-xs"
										/>
										<span className="text-muted-foreground text-xs">
											= RM {(item.agreedPrice * item.quantity).toFixed(2)}
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 shrink-0"
									onClick={() => removeItem(item.rentableItemId)}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				)}

				{/* Printing Services */}
				{printings.length > 0 && (
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<Printer className="h-4 w-4" />
							Printing Services
						</div>
						{printings.map((printing) => (
							<div
								key={printing.printingServiceId}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								<div className="flex-1 space-y-1">
									<p className="font-medium text-sm">{printing.name}</p>
									<p className="text-muted-foreground text-xs">
										RM {printing.agreedPrice.toFixed(2)} per{" "}
										{printing.unitOfMeasure}
									</p>
									<div className="flex items-center gap-2">
										<Input
											type="number"
											min="1"
											value={printing.quantity}
											onChange={(e) =>
												updatePrintingQuantity(
													printing.printingServiceId,
													Number.parseInt(e.target.value) || 1,
												)
											}
											className="h-7 w-20 rounded-none text-xs"
										/>
										<span className="text-muted-foreground text-xs">
											= RM {(printing.agreedPrice * printing.quantity).toFixed(2)}
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 shrink-0"
									onClick={() => removePrinting(printing.printingServiceId)}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				)}

				<Separator />

				{/* Total */}
				<div className="flex items-center justify-between">
					<span className="font-semibold">Total Amount</span>
					<span className="font-bold text-lg">RM {totalAmount.toFixed(2)}</span>
				</div>
			</CardContent>

			<CardFooter>
				{onCheckout ? (
					<Button onClick={onCheckout} className="w-full rounded-none">
						Proceed to Checkout
					</Button>
				) : (
					<Button
						onClick={() => setShowReviewModal(true)}
						className="w-full gap-2 rounded-none"
					>
						<CheckCircle2 className="h-4 w-4" />
						Review & Submit Order
					</Button>
				)}
			</CardFooter>

			{/* Review & Submit Modal */}
			{eventVendorId && (
				<ReviewSubmitModal
					eventId={eventId}
					eventVendorId={eventVendorId}
					open={showReviewModal}
					onOpenChange={setShowReviewModal}
				/>
			)}
		</Card>
	);
}
