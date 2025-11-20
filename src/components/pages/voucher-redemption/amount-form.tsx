"use client";

import { DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountFormProps {
	onSubmit: (amount: number) => void;
	isProcessing: boolean;
}

export function AmountForm({ onSubmit, isProcessing }: AmountFormProps) {
	const [amount, setAmount] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const numAmount = Number.parseFloat(amount);
		if (numAmount > 0) {
			onSubmit(numAmount);
		}
	};

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-accent p-6 shadow-sm">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2 text-center">
					<div className="mx-auto inline-flex rounded-lg border border-primary/10 bg-primary/5 p-4">
						<DollarSign className="h-12 w-12 text-primary/60" />
					</div>
					<h3 className="font-semibold text-foreground text-xl">
						Enter Transaction Amount
					</h3>
					<p className="text-muted-foreground text-sm">
						Enter the gross amount before discount
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="amount">Gross Amount</Label>
					<div className="relative">
						<DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="amount"
							type="number"
							step="0.01"
							min="0.01"
							placeholder="0.00"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="pl-9"
							required
							disabled={isProcessing}
						/>
					</div>
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
