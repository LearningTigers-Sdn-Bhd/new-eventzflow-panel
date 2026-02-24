"use client";

import {
	ArrowLeft,
	CheckCircle,
	Gift,
	Loader2,
	PartyPopper,
	Percent,
	Ticket,
	TicketCheck,
	User,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VisitorDetails, VoucherDetails } from "./types";

interface RedemptionReviewCardProps {
	voucherDetails: VoucherDetails | null;
	visitorDetails: VisitorDetails | null;
	onSubmit: (amount: number) => void;
	onBack: () => void;
	isProcessing: boolean;
}

export function RedemptionReviewCard({
	voucherDetails,
	visitorDetails,
	onSubmit,
	onBack,
	isProcessing,
}: RedemptionReviewCardProps) {
	const [amount, setAmount] = useState("");

	if (!voucherDetails || !visitorDetails) {
		return null;
	}

	const isFreeItem = voucherDetails.voucherType === "free_item";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isFreeItem) {
			onSubmit(0);
		} else {
			const numAmount = Number.parseFloat(amount);
			if (numAmount > 0) {
				onSubmit(numAmount);
			}
		}
	};

	const calculateOriginalPrice = () => {
		const finalAmount = Number.parseFloat(amount);
		if (!amount || finalAmount <= 0) return 0;

		let originalPrice = 0;
		switch (voucherDetails.voucherType) {
			case "percentage":
				originalPrice = finalAmount / (1 - voucherDetails.voucherValue / 100);
				break;
			case "fixed_amount":
				originalPrice = finalAmount + voucherDetails.voucherValue;
				break;
			default:
				return 0;
		}
		return originalPrice;
	};

	const getVoucherIcon = () => {
		switch (voucherDetails.voucherType) {
			case "free_item":
				return <Gift className="h-4 w-4 text-green-600" />;
			case "percentage":
				return <Percent className="h-4 w-4 text-blue-600" />;
			case "fixed_amount":
				return <Wallet className="h-4 w-4 text-purple-600" />;
			default:
				return <Ticket className="h-4 w-4 text-gray-600" />;
		}
	};

	const getVoucherTypeLabel = () => {
		switch (voucherDetails.voucherType) {
			case "free_item":
				return "Free Item";
			case "percentage":
				return "Percentage Discount";
			case "fixed_amount":
				return "Fixed Amount";
			default:
				return "Unknown";
		}
	};

	const getVoucherValueDisplay = () => {
		switch (voucherDetails.voucherType) {
			case "free_item":
				return "FREE";
			case "percentage":
				return `${voucherDetails.voucherValue}% OFF`;
			case "fixed_amount":
				return `RM ${voucherDetails.voucherValue.toFixed(2)} OFF`;
			default:
				return "-";
		}
	};

	const vouchersLeft =
		voucherDetails.totalRedemptionAvailable === 0
			? "Unlimited"
			: `${voucherDetails.totalRedemptionAvailable - voucherDetails.redeemedCount} / ${voucherDetails.totalRedemptionAvailable}`;

	const originalPrice = calculateOriginalPrice();

	return (
		<form onSubmit={handleSubmit}>
			<Card className="space-y-4 p-4 sm:space-y-5 sm:p-6">
				<div className="flex items-center gap-2">
					<CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
					<h3 className="font-semibold text-base sm:text-lg">
						Review & Confirm
					</h3>
				</div>

				{/* Desktop: 2-column layout, Mobile: stacked */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{/* Left Column: Visitor & Voucher Info */}
					<div className="space-y-4">
						{/* Attendee Information */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
								{visitorDetails.redeemerType === "ticket" ? (
									<TicketCheck className="h-3.5 w-3.5" />
								) : (
									<User className="h-3.5 w-3.5" />
								)}
								<span>{visitorDetails.redeemerType === "ticket" ? "Ticket Holder" : "Visitor"}</span>
							</div>
							<div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Name</span>
									<span className="text-right font-medium">
										{visitorDetails.fullName}
									</span>
								</div>
								{visitorDetails.email && (
									<div className="flex justify-between gap-2">
										<span className="text-muted-foreground text-xs">Email</span>
										<span className="truncate text-right text-xs">
											{visitorDetails.email}
										</span>
									</div>
								)}
								{visitorDetails.phone && (
									<div className="flex justify-between gap-2">
										<span className="text-muted-foreground text-xs">Phone</span>
										<span className="text-right text-xs">
											{visitorDetails.phone}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Voucher Information */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
								{getVoucherIcon()}
								<span>Voucher</span>
							</div>
							<div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Title</span>
									<span className="text-right font-medium">
										{voucherDetails.title}
									</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Type</span>
									<span className="text-right font-medium text-xs">
										{getVoucherTypeLabel()}
									</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">
										Discount
									</span>
									<span className="text-right font-semibold text-green-600">
										{getVoucherValueDisplay()}
									</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">
										Available
									</span>
									<span className="text-right font-medium text-xs">
										{vouchersLeft}
									</span>
								</div>
								{voucherDetails.description && (
									<div className="mt-1.5 border-t pt-1.5">
										<p className="text-muted-foreground text-xs">
											{voucherDetails.description}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Amount Entry */}
					<div className="space-y-4">
						{isFreeItem ? (
							<div className="flex h-full items-center justify-center rounded-lg border border-green-200 bg-green-50 p-4">
								<div className="space-y-3 text-center">
									<div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
										<PartyPopper className="h-8 w-8 text-green-600" />
									</div>
									<p className="font-medium text-green-700 text-sm">
										Free Item Voucher
									</p>
									<p className="text-green-600 text-xs">No payment required</p>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="amount" className="text-sm">
										Final Sale Price (After Discount)
									</Label>
									<div className="relative">
										<span className="-translate-y-1/2 absolute top-1/2 left-3 font-medium text-muted-foreground text-sm">
											RM
										</span>
										<Input
											id="amount"
											type="number"
											step="0.01"
											min="0.01"
											placeholder="0.00"
											value={amount}
											onChange={(e) => setAmount(e.target.value)}
											className="h-11 pl-12 text-base"
											required
											disabled={isProcessing}
											autoFocus
										/>
									</div>
									<p className="text-muted-foreground text-xs">
										Enter what the customer pays after discount
									</p>
								</div>

								{/* Discount Calculation Display - Always visible */}
								<div
									className={`space-y-2 rounded-lg border p-3 ${
										voucherDetails.voucherType === "percentage"
											? "border-blue-200 bg-blue-50"
											: "border-green-200 bg-green-50"
									}`}
								>
									<div className="flex items-center justify-between">
										<span
											className={`font-medium text-xs ${
												voucherDetails.voucherType === "percentage"
													? "text-blue-700"
													: "text-green-700"
											}`}
										>
											Discount Applied
										</span>
										<span
											className={`font-semibold text-sm ${
												voucherDetails.voucherType === "percentage"
													? "text-blue-900"
													: "text-green-900"
											}`}
										>
											{getVoucherValueDisplay()}
										</span>
									</div>
									<div
										className={`border-t pt-2 ${
											voucherDetails.voucherType === "percentage"
												? "border-blue-200"
												: "border-green-200"
										}`}
									>
										<div className="flex items-center justify-between">
											<span
												className={`text-xs ${
													voucherDetails.voucherType === "percentage"
														? "text-blue-700"
														: "text-green-700"
												}`}
											>
												Original Price
											</span>
											<span
												className={`font-bold text-base ${
													voucherDetails.voucherType === "percentage"
														? "text-blue-900"
														: "text-green-900"
												}`}
											>
												RM {originalPrice.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						disabled={isProcessing}
						className="min-w-[100px]"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
					<Button
						type="submit"
						disabled={
							isProcessing ||
							(!isFreeItem && (!amount || Number.parseFloat(amount) <= 0))
						}
						className="min-w-[160px]"
					>
						{isProcessing ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							"Confirm & Redeem"
						)}
					</Button>
				</div>
			</Card>
		</form>
	);
}
