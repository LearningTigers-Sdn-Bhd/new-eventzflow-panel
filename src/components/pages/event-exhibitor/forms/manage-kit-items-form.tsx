"use client";

import { Package } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ExhibitorKitItem } from "@/lib/api/exhibitor-kit/response";
import { cn } from "@/lib/utils";

function ExpandableText({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<p
					className={cn(
						"line-clamp-1 cursor-pointer text-[10px] text-muted-foreground transition-colors hover:text-foreground md:text-xs",
						className,
					)}
					title="Click to view full text"
				>
					{text}
				</p>
			</PopoverTrigger>
			<PopoverContent className="max-h-80 w-72 overflow-y-auto p-3">
				<p className="wrap-break-word text-xs">{text}</p>
			</PopoverContent>
		</Popover>
	);
}

interface ManageKitItemsFormProps {
	items: ExhibitorKitItem[];
	onClose?: () => void;
}

export function ManageKitItemsForm({ items }: ManageKitItemsFormProps) {
	const subtotal = items.reduce(
		(sum, item) => sum + item.quantity * Number(item.agreed_price),
		0,
	);

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center border border-dashed p-4 py-12 text-muted-foreground md:py-16">
				<div className="mb-3 rounded-full bg-muted p-3 md:mb-4 md:p-4">
					<Package className="h-6 w-6 opacity-50 md:h-8 md:w-8" />
				</div>
				<p className="font-medium text-sm md:text-base">No items ordered</p>
				<p className="mt-1 px-4 text-center text-xs md:text-sm">
					Rentable items will appear here once ordered.
				</p>
			</div>
		);
	}

	return (
		<section className="w-full space-y-3 border border-dashed p-4 md:space-y-4">
			{/* Items Grid - 3 columns on desktop */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
				{items.map((item) => {
					const total = item.quantity * Number(item.agreed_price);
					return (
						<div
							key={item.id}
							className="flex flex-col rounded-none border bg-card p-3 transition-colors hover:bg-accent/50 md:p-4"
						>
							{/* Header */}
							<div className="mb-2 flex items-start gap-2 md:mb-3 md:gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-primary/10 text-primary md:h-9 md:w-9">
									<Package className="h-3.5 w-3.5 md:h-4 md:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-xs leading-tight md:text-sm">
										{item.rentable_item?.name ||
											`Item #${item.rentable_item_id}`}
									</p>
									{item.notes && (
										<div className="mt-0.5 md:mt-1">
											<ExpandableText text={item.notes} />
										</div>
									)}
								</div>
							</div>
							{/* Stats */}
							<div className="flex items-center justify-between border-t border-dashed pt-2 md:pt-3">
								<div>
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Qty
									</p>
									<p className="font-medium text-xs md:text-sm">
										{item.quantity}
									</p>
								</div>
								<div className="text-center">
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Price
									</p>
									<p className="font-medium text-xs md:text-sm">
										RM {Number(item.agreed_price).toFixed(2)}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Total
									</p>
									<p className="font-semibold text-primary text-xs md:text-sm">
										RM {total.toFixed(2)}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between rounded-none border-2 border-dashed bg-muted/30 p-3 md:p-4">
				<div className="flex items-center gap-2">
					<Package className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
					<span className="font-medium text-xs md:text-sm">
						{items.length} item{items.length !== 1 ? "s" : ""}
					</span>
				</div>
				<div className="text-right">
					<p className="text-muted-foreground text-xs md:text-sm">Subtotal</p>
					<p className="font-bold text-lg md:text-xl">
						RM {subtotal.toFixed(2)}
					</p>
				</div>
			</div>
		</section>
	);
}
