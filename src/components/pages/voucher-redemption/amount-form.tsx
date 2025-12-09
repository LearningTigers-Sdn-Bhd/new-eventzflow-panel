"use client";

import { Loader2, Banknote } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VoucherDetails } from "./types";

interface AmountFormProps {
	onSubmit: (amount: number) => void;
	isProcessing: boolean;
	voucherDetails: VoucherDetails | null;
}

export function AmountForm({ onSubmit, isProcessing, voucherDetails }: AmountFormProps) {
	const [amount, setAmount] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const numAmount = Number.parseFloat(amount);
		if (numAmount > 0) {
			onSubmit(numAmount);
		}
	};

	const calculateOriginalPrice = () => {
		const finalAmount = Number.parseFloat(amount);
		if (!voucherDetails || !amount || finalAmount <= 0) return null;

		let originalPrice = 0;
		switch (voucherDetails.voucherType) {
			case "percentage":
				// finalAmount = originalPrice * (1 - discount/100)
				// originalPrice = finalAmount / (1 - discount/100)
				originalPrice = finalAmount / (1 - voucherDetails.voucherValue / 100);
				break;
			case "fixed_amount":
				// originalPrice = finalAmount + discount
				originalPrice = finalAmount + voucherDetails.voucherValue;
				break;
			default:
				return null;
		}

		return originalPrice;
	};

	const getDiscountInfo = () => {
		if (!voucherDetails) return null;
		const originalPrice = calculateOriginalPrice();

		switch (voucherDetails.voucherType) {
			case "percentage":
				return (
					<div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
						<p className="text-center text-blue-900 text-sm">
							<span className="font-semibold">{voucherDetails.voucherValue}% discount</span> applied
						</p>
						{originalPrice && (
							<div className="border-blue-200 border-t pt-2 text-center">
								<p className="text-blue-700 text-xs">Original Price</p>
								<p className="font-semibold text-blue-900 text-lg">RM {originalPrice.toFixed(2)}</p>
							</div>
						)}
					</div>
				);
			case "fixed_amount":
				return (
					<div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
						<p className="text-center text-green-900 text-sm">
							<span className="font-semibold">RM {voucherDetails.voucherValue.toFixed(2)} discount</span> applied
						</p>
						{originalPrice && (
							<div className="border-green-200 border-t pt-2 text-center">
								<p className="text-green-700 text-xs">Original Price</p>
								<p className="font-semibold text-green-900 text-lg">RM {originalPrice.toFixed(2)}</p>
							</div>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-accent p-6 shadow-sm">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2 text-center">
					<div className="mx-auto inline-flex rounded-lg border border-primary/10 bg-primary/5 p-4">
						<Banknote className="h-12 w-12 text-primary/60" />
					</div>
					<h3 className="font-semibold text-foreground text-xl">
						Enter Final Sale Price
					</h3>
					<p className="text-muted-foreground text-sm">
						Enter the final price after discount (what customer pays)
					</p>
				</div>

				{getDiscountInfo()}

				<div className="space-y-2">
					<Label htmlFor="amount">Final Sale Price (After Discount)</Label>
					<div className="relative">
						<span className="-translate-y-1/2 absolute top-1/2 left-3 font-medium text-muted-foreground text-sm">RM</span>
						<Input
							id="amount"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="pl-12"
							required
							disabled={isProcessing}
						/>
					</div>
					<p className="text-muted-foreground text-xs">
						Enter what the customer actually pays after the voucher discount is applied
					</p>
				</div>

				<Button
					type="submit"
					size="lg"
					className="w-full gap-2"
					disabled={isProcessing || !amount || Number.parseFloat(amount) <= 0}
				>
					{isProcessing ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Processing...
						</>
					) : (
						"Redeem Voucher"
					)}
				</Button>
			</form>
		</Card>
	);
}
