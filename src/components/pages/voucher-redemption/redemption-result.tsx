"use client";

import { CheckCircle2, XCircle, RotateCcw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RedemptionResult } from "./types";

interface RedemptionResultProps {
	result: RedemptionResult;
	onReset: () => void;
}

export function RedemptionResultCard({
	result,
	onReset,
}: RedemptionResultProps) {
	const isSuccess = result.success;
	const isFreeItem = result.voucherType === "free_item";

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-accent p-6 shadow-sm">
			<div className="space-y-6 text-center">
				{/* Icon */}
				<div
					className={`mx-auto inline-flex rounded-lg border p-4 ${
						isSuccess
							? "border-green-500/20 bg-green-500/10"
							: "border-red-500/20 bg-red-500/10"
					}`}
				>
					{isSuccess ? (
						isFreeItem ? (
							<PartyPopper className="h-16 w-16 text-green-500" />
						) : (
							<CheckCircle2 className="h-16 w-16 text-green-500" />
						)
					) : (
						<XCircle className="h-16 w-16 text-red-500" />
					)}
				</div>

				{/* Message */}
				<div className="space-y-2">
					<h3
						className={`font-semibold text-xl ${
							isSuccess ? "text-green-600" : "text-red-600"
						}`}
					>
						{isSuccess 
							? isFreeItem 
								? "Free Item Redeemed!" 
								: "Redemption Successful!"
							: "Redemption Failed"}
					</h3>
					<p className="text-muted-foreground text-sm">
						{isFreeItem && isSuccess 
							? "The free item voucher has been successfully redeemed"
							: result.message}
					</p>
				</div>

				{/* Details - Only show for non-free items */}
				{isSuccess && !isFreeItem && result.netAmount !== undefined && (
					<div className="space-y-3 rounded-lg border bg-white p-4">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Discount Applied:
							</span>
							<span className="font-semibold text-green-600">
								RM {result.discountApplied?.toFixed(2) || "0.00"}
							</span>
						</div>
						<div className="flex items-center justify-between border-t pt-3">
							<span className="font-medium">Net Amount:</span>
							<span className="font-bold text-lg">
								RM {result.netAmount.toFixed(2)}
							</span>
						</div>
						{result.voucherType && (
							<div className="flex items-center justify-between text-muted-foreground text-xs">
								<span>Voucher Type:</span>
								<span className="capitalize">
									{result.voucherType.replace("_", " ")}
								</span>
							</div>
						)}
					</div>
				)}

				{/* Marketing Quote */}
				{isSuccess && (
					<div className="rounded-lg border border-muted bg-muted/50 px-4 py-3">
						<p className="text-muted-foreground text-sm italic">
							{isFreeItem 
								? "\"Every great experience starts with a special moment. Thank you for being here!\"" 
								: "\"Great savings make great memories. Enjoy your visit!\""}
						</p>
					</div>
				)}

				{/* Actions */}
				<Button onClick={onReset} size="lg" className="w-full gap-2">
					<RotateCcw className="h-4 w-4" />
					Scan Another Voucher
				</Button>
			</div>
		</Card>
	);
}
