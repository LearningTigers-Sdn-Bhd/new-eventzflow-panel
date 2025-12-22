"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Link as LinkIcon, Package, Printer, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useExhibitorCart } from "@/stores/exhibitor-cart-store";
import { updateExhibitorKit, getExhibitorKits, submitExhibitorKitOrder } from "@/lib/api/exhibitor-kit";
import { OrderItemCard } from "./order-item-card";

interface ReviewSubmitPageProps {
	eventId: number;
	eventVendorId: number;
}

export function ReviewSubmitPage({ eventId, eventVendorId }: ReviewSubmitPageProps) {
	const router = useRouter();
	const {
		items,
		printings,
		getTotalAmount,
		clearCart,
		updateItemNotes,
		updatePrintingNotes,
		updatePrintingFileReference,
	} = useExhibitorCart();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalAmount = getTotalAmount();
	const itemsTotal = items.reduce((sum, item) => sum + item.quantity * item.agreedPrice, 0);
	const printingsTotal = printings.reduce((sum, p) => sum + p.quantity * p.agreedPrice, 0);

	// Fetch exhibitor kits to find the one for this vendor
	const { data: exhibitorKits, isLoading: isLoadingKit } = useQuery({
		queryKey: ["exhibitor-kits", eventId],
		queryFn: () => getExhibitorKits(eventId),
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
					notes: item.notes || null,
				})),
				exhibitor_kit_printings_attributes: printings.map((printing) => ({
					printing_service_id: printing.printingServiceId,
					quantity: printing.quantity,
					agreed_price: printing.agreedPrice,
					notes: printing.notes || null,
					file_reference: printing.fileReference || null,
				})),
			};

			// First, update the exhibitor kit with items/printings
			await updateExhibitorKit(eventId, exhibitorKitId, payload);

			// Then, submit the order to auto-create a payment record
			return submitExhibitorKitOrder(eventId, exhibitorKitId);
		},
		onSuccess: () => {
			toast.success("Order submitted successfully! A payment request has been created.");
			clearCart();
			// Redirect to my-items page to see the submitted order
			router.push(`/event/${eventId}/my-items`);
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

	const handleBack = () => {
		router.back();
	};

	// Loading state
	if (isLoadingKit) {
		return (
			<div className="min-h-screen p-6">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="h-8 w-32 mb-6" />
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-4">
							<Skeleton className="h-[300px] w-full" />
							<Skeleton className="h-[300px] w-full" />
						</div>
						<div>
							<Skeleton className="h-[250px] w-full" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Error state - no kit found
	if (!exhibitorKitId) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md rounded-none border bg-background p-8 text-center">
					<p className="mb-4 text-muted-foreground">
						Exhibitor kit not found. Please contact support.
					</p>
					<Button onClick={handleBack} variant="outline" className="rounded-none">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// Empty cart state
	if (items.length === 0 && printings.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md rounded-none border bg-background p-8 text-center">
					<ShoppingCart className="mx-auto mb-4 size-12 text-muted-foreground" />
					<h2 className="mb-2 font-semibold text-lg">Your cart is empty</h2>
					<p className="mb-6 text-muted-foreground text-sm">
						Add items or printing services before reviewing your order.
					</p>
					<Button onClick={handleBack} variant="outline" className="rounded-none">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Header */}
			<div className="border-b">
				<div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="font-semibold text-xl sm:text-2xl">Review & Submit Order</h1>
							<p className="text-muted-foreground text-xs sm:text-sm">
								Review your order and add any notes before submitting
							</p>
						</div>
						<Button
							variant="default"
							onClick={handleBack}
							className="gap-2 rounded-none w-full sm:w-auto"
						>
							<ArrowLeft className="size-4" />
							Back to Cart
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content - Two Column Layout */}
			<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Left Column - Items */}
					<div className="lg:col-span-2 space-y-6">
						{/* Rentable Items Section */}
						{items.length > 0 && (
							<div className="rounded-none border bg-background">
								<div className="flex items-center gap-2 p-4 border-b">
									<Package className="size-4 text-primary" />
									<h2 className="font-medium text-sm uppercase tracking-wide">
										Rentable Items ({items.length})
									</h2>
								</div>

								<div className="divide-y">
									{items.map((item) => (
										<OrderItemCard
											key={item.rentableItemId}
											name={item.name}
											quantity={item.quantity}
											price={item.agreedPrice}
											imageUrl={item.imageUrl}
										>
											<div className="space-y-1.5">
												<Label htmlFor={`item-notes-${item.rentableItemId}`} className="text-xs text-muted-foreground">
													Notes (optional)
												</Label>
												<Textarea
													id={`item-notes-${item.rentableItemId}`}
													placeholder="e.g., Place near entrance, specific color preference..."
													value={item.notes || ""}
													onChange={(e) => updateItemNotes(item.rentableItemId, e.target.value)}
													className="rounded-none resize-none text-sm"
													rows={2}
												/>
											</div>
										</OrderItemCard>
									))}
								</div>
							</div>
						)}

						{/* Printing Services Section */}
						{printings.length > 0 && (
							<div className="rounded-none border bg-background">
								<div className="flex items-center gap-2 p-4 border-b">
									<Printer className="size-4 text-primary" />
									<h2 className="font-medium text-sm uppercase tracking-wide">
										Printing Services ({printings.length})
									</h2>
								</div>

								<div className="divide-y">
									{printings.map((printing) => (
										<OrderItemCard
											key={printing.printingServiceId}
											name={printing.name}
											quantity={printing.quantity}
											price={printing.agreedPrice}
											imageUrl={printing.imageUrl}
										>
											<div className="space-y-1.5">
												<Label htmlFor={`printing-notes-${printing.printingServiceId}`} className="text-xs text-muted-foreground">
													Notes (optional)
												</Label>
												<Textarea
													id={`printing-notes-${printing.printingServiceId}`}
													placeholder="e.g., Use matte finish, specific dimensions..."
													value={printing.notes || ""}
													onChange={(e) => updatePrintingNotes(printing.printingServiceId, e.target.value)}
													className="rounded-none resize-none text-sm"
													rows={2}
												/>
											</div>

											<div className="space-y-1.5">
												<Label htmlFor={`printing-file-${printing.printingServiceId}`} className="text-xs text-muted-foreground flex items-center gap-1">
													<LinkIcon className="size-3" />
													Design File URL
												</Label>
												<Input
													id={`printing-file-${printing.printingServiceId}`}
													type="url"
													placeholder="https://drive.google.com/file/..."
													value={printing.fileReference || ""}
													onChange={(e) => updatePrintingFileReference(printing.printingServiceId, e.target.value)}
													className="rounded-none text-sm"
												/>
												<p className="text-muted-foreground text-xs">
													Upload your design to Google Drive, Dropbox, or any file hosting service and paste the link here.
												</p>
											</div>
										</OrderItemCard>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Order Summary (Sticky) */}
					<div className="lg:col-span-1">
						<div className="rounded-none border bg-background sticky top-6">
							<div className="p-4 border-b">
								<h2 className="font-semibold">Order Summary</h2>
							</div>

							<div className="p-4 space-y-3">
								{/* Items subtotal */}
								{items.length > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Rentable Items ({items.length})</span>
										<span>RM {itemsTotal.toFixed(2)}</span>
									</div>
								)}

								{/* Printing subtotal */}
								{printings.length > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Printing Services ({printings.length})</span>
										<span>RM {printingsTotal.toFixed(2)}</span>
									</div>
								)}

								<Separator />

								{/* Total */}
								<div className="flex items-center justify-between">
									<span className="font-semibold">Total Amount</span>
									<span className="font-bold text-xl">RM {totalAmount.toFixed(2)}</span>
								</div>
							</div>

							<div className="p-4 border-t bg-muted/30">
								<Button
									onClick={handleSubmit}
									disabled={isSubmitting}
									className="w-full gap-2 rounded-none h-12 text-base"
								>
									{isSubmitting ? (
										"Submitting..."
									) : (
										<>
											<CheckCircle2 className="size-5" />
											Submit Order
										</>
									)}
								</Button>
								<p className="text-muted-foreground text-xs text-center mt-3">
									A payment request will be created after submission
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
