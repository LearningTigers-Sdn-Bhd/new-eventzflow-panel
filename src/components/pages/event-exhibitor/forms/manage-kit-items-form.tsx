"use client";

import { Package } from "lucide-react";
import type { ExhibitorKitItem } from "@/lib/api/exhibitor-kit/response";

interface ManageKitItemsFormProps {
	items: ExhibitorKitItem[];
	onClose?: () => void;
}

export function ManageKitItemsForm({ items }: ManageKitItemsFormProps) {
	const subtotal = items.reduce(
		(sum, item) => sum + item.quantity * Number(item.agreed_price),
		0
	);

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 md:py-16 text-muted-foreground border border-dashed p-4">
				<div className="rounded-full bg-muted p-3 md:p-4 mb-3 md:mb-4">
					<Package className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
				</div>
				<p className="font-medium text-sm md:text-base">No items ordered</p>
				<p className="text-xs md:text-sm mt-1 text-center px-4">Rentable items will appear here once ordered.</p>
			</div>
		);
	}

	return (
		<section className="w-full space-y-3 md:space-y-4 border border-dashed p-4">
			{/* Items Grid - 3 columns on desktop */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
				{items.map((item) => {
					const total = item.quantity * Number(item.agreed_price);
					return (
						<div
							key={item.id}
							className="flex flex-col rounded-none border bg-card p-3 md:p-4 transition-colors hover:bg-accent/50"
						>
							{/* Header */}
							<div className="flex items-start gap-2 md:gap-3 mb-2 md:mb-3">
								<div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary">
									<Package className="h-3.5 w-3.5 md:h-4 md:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium leading-tight text-xs md:text-sm">
										{item.rentable_item?.name || `Item #${item.rentable_item_id}`}
									</p>
									{item.notes && (
										<p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-1">
											{item.notes}
										</p>
									)}
								</div>
							</div>
							{/* Stats */}
							<div className="flex items-center justify-between pt-2 md:pt-3 border-t border-dashed">
								<div>
									<p className="text-[10px] md:text-xs text-muted-foreground">Qty</p>
									<p className="font-medium text-xs md:text-sm">{item.quantity}</p>
								</div>
								<div className="text-center">
									<p className="text-[10px] md:text-xs text-muted-foreground">Price</p>
									<p className="font-medium text-xs md:text-sm">RM {Number(item.agreed_price).toFixed(2)}</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] md:text-xs text-muted-foreground">Total</p>
									<p className="font-semibold text-primary text-xs md:text-sm">RM {total.toFixed(2)}</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between rounded-none border-2 border-dashed bg-muted/30 p-3 md:p-4">
				<div className="flex items-center gap-2">
					<Package className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
					<span className="font-medium text-xs md:text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
				</div>
				<div className="text-right">
					<p className="text-xs md:text-sm text-muted-foreground">Subtotal</p>
					<p className="text-lg md:text-xl font-bold">RM {subtotal.toFixed(2)}</p>
				</div>
			</div>
		</section>
	);
}
