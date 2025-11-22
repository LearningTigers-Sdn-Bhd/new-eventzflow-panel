"use client";

import { ArrowLeft, CheckCircle, Gift, Percent, Ticket, User, Wallet, Loader2, PartyPopper } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VoucherDetails, VisitorDetails } from "./types";

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

	const vouchersLeft = voucherDetails.totalRedemptionAvailable === 0 
		? "Unlimited" 
		: `${voucherDetails.totalRedemptionAvailable - voucherDetails.redeemedCount} / ${voucherDetails.totalRedemptionAvailable}`;

	const originalPrice = calculateOriginalPrice();

	return (
		<form onSubmit={handleSubmit}>
			<Card className="p-4 sm:p-6 space-y-4 sm:space-y-5">
				<div className="flex items-center gap-2">
					<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
					<h3 className="text-base sm:text-lg font-semibold">Review & Confirm</h3>
				</div>

				{/* Desktop: 2-column layout, Mobile: stacked */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Left Column: Visitor & Voucher Info */}
					<div className="space-y-4">
						{/* Visitor Information */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
								<User className="h-3.5 w-3.5" />
								<span>Visitor</span>
							</div>
							<div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Name</span>
									<span className="font-medium text-right">{visitorDetails.fullName}</span>
								</div>
								{visitorDetails.email && (
									<div className="flex justify-between gap-2">
										<span className="text-muted-foreground text-xs">Email</span>
										<span className="text-xs text-right truncate">{visitorDetails.email}</span>
									</div>
								)}
								{visitorDetails.phone && (
									<div className="flex justify-between gap-2">
										<span className="text-muted-foreground text-xs">Phone</span>
										<span className="text-xs text-right">{visitorDetails.phone}</span>
									</div>
								)}
							</div>
						</div>

						{/* Voucher Information */}
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
								{getVoucherIcon()}
								<span>Voucher</span>
							</div>
							<div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Title</span>
									<span className="font-medium text-right">{voucherDetails.title}</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Type</span>
									<span className="font-medium text-right text-xs">{getVoucherTypeLabel()}</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Discount</span>
									<span className="font-semibold text-green-600 text-right">
										{getVoucherValueDisplay()}
									</span>
								</div>
								<div className="flex justify-between gap-2">
									<span className="text-muted-foreground text-xs">Available</span>
									<span className="font-medium text-right text-xs">{vouchersLeft}</span>
								</div>
								{voucherDetails.description && (
									<div className="pt-1.5 mt-1.5 border-t">
										<p className="text-xs text-muted-foreground">{voucherDetails.description}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column: Amount Entry */}
					<div className="space-y-4">
						{isFreeItem ? (
							<div className="rounded-lg bg-green-50 border border-green-200 p-4 h-full flex items-center justify-center">
								<div className="text-center space-y-3">
									<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
										<PartyPopper className="h-8 w-8 text-green-600" />
									</div>
									<p className="text-sm text-green-700 font-medium">
										Free Item Voucher
									</p>
									<p className="text-xs text-green-600">
										No payment required
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="amount" className="text-sm">Final Sale Price (After Discount)</Label>
									<div className="relative">
										<span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground text-sm font-medium">
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
											className="pl-12 h-11 text-base"
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
								<div className={`rounded-lg border p-3 space-y-2 ${
									voucherDetails.voucherType === "percentage" 
										? "border-blue-200 bg-blue-50" 
										: "border-green-200 bg-green-50"
								}`}>
									<div className="flex justify-between items-center">
										<span className={`text-xs font-medium ${
											voucherDetails.voucherType === "percentage" 
												? "text-blue-700" 
												: "text-green-700"
										}`}>
											Discount Applied
										</span>
										<span className={`text-sm font-semibold ${
											voucherDetails.voucherType === "percentage" 
												? "text-blue-900" 
												: "text-green-900"
										}`}>
											{getVoucherValueDisplay()}
										</span>
									</div>
									<div className={`pt-2 border-t ${
										voucherDetails.voucherType === "percentage" 
											? "border-blue-200" 
											: "border-green-200"
									}`}>
										<div className="flex justify-between items-center">
											<span className={`text-xs ${
												voucherDetails.voucherType === "percentage" 
													? "text-blue-700" 
													: "text-green-700"
											}`}>
												Original Price
											</span>
											<span className={`text-base font-bold ${
												voucherDetails.voucherType === "percentage" 
													? "text-blue-900" 
													: "text-green-900"
											}`}>
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
				<div className="flex gap-3 pt-2 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						disabled={isProcessing}
						className="min-w-[100px]"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back
					</Button>
					<Button
						type="submit"
						disabled={isProcessing || (!isFreeItem && (!amount || Number.parseFloat(amount) <= 0))}
						className="min-w-[160px]"
					>
						{isProcessing ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

