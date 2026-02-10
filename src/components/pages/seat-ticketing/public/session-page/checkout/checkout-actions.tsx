import { Button } from "@/components/ui/button";

interface CheckoutActionsProps {
	totalPrice: number;
	isProcessing: boolean;
	onCancel: () => void;
}

export default function CheckoutActions({
	totalPrice,
	isProcessing,
	onCancel,
}: CheckoutActionsProps) {
	return (
		<div className="pt-6">
			<div className="mb-6 flex items-center justify-between">
				<span className="font-medium text-slate-500">Total Amount</span>
				<span className="text-2xl font-black text-brand-green">
					RM{totalPrice.toFixed(2)}
				</span>
			</div>
			<div className="flex flex-col gap-3">
				<Button
					type="button"
					variant="outline"
					className="h-12 w-full rounded-none"
					onClick={onCancel}
				>
					Back to seats
				</Button>
				<Button
					type="submit"
					className="h-12 w-full rounded-none bg-brand-green text-base font-bold hover:bg-brand-green/90"
					disabled={isProcessing}
				>
					{isProcessing ? "Processing..." : "Complete Reservation"}
				</Button>
			</div>
		</div>
	);
}
