"use client";

import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
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
						<CheckCircle2 className="h-16 w-16 text-green-500" />
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
						{isSuccess ? "Redemption Successful!" : "Redemption Failed"}
					</h3>
					<p className="text-muted-foreground text-sm">{result.message}</p>
				</div>

				{/* Details */}
				{isSuccess && result.netAmount !== undefined && (
					<div className="space-y-3 rounded-lg border bg-white p-4">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Discount Applied:
							</span>
							<span className="font-semibold text-green-600">
								${result.discountApplied?.toFixed(2)}
							</span>
						</div>
						<div className="flex items-center justify-between border-t pt-3">
							<span className="font-medium">Net Amount:</span>
							<span className="font-bold text-lg">
								${result.netAmount.toFixed(2)}
							</span>
						</div>
						{result.voucherType && (
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>Voucher Type:</span>
								<span className="capitalize">
									{result.voucherType.replace("_", " ")}
								</span>
							</div>
						)}
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
