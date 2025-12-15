"use client";

import { FileText, Printer } from "lucide-react";
import type { ExhibitorKitPrinting } from "@/lib/api/exhibitor-kit/response";

interface ManageKitPrintingsFormProps {
	printings: ExhibitorKitPrinting[];
	onClose?: () => void;
}

export function ManageKitPrintingsForm({ printings }: ManageKitPrintingsFormProps) {
	const subtotal = printings.reduce(
		(sum, printing) => sum + printing.quantity * Number(printing.agreed_price),
		0
	);

	if (printings.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center border border-dashed p-4 py-12 text-muted-foreground md:py-16">
				<div className="mb-3 rounded-full bg-muted p-3 md:mb-4 md:p-4">
					<Printer className="h-6 w-6 opacity-50 md:h-8 md:w-8" />
				</div>
				<p className="font-medium text-sm md:text-base">No printing services ordered</p>
				<p className="mt-1 px-4 text-center text-xs md:text-sm">Printing orders will appear here once placed.</p>
			</div>
		);
	}

	return (
		<section className="w-full space-y-3 border border-dashed p-4 md:space-y-4">
			{/* Printings Grid - 3 columns on desktop */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
				{printings.map((printing) => {
					const total = printing.quantity * Number(printing.agreed_price);
					return (
						<div
							key={printing.id}
							className="flex flex-col overflow-hidden rounded-none border bg-card transition-colors hover:bg-accent/50"
						>
							{/* Header */}
							<div className="flex items-start gap-2 p-3 pb-2 md:gap-3 md:p-4 md:pb-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-violet-500/10 text-violet-600 md:h-9 md:w-9">
									<Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-xs leading-tight md:text-sm">
										{printing.printing_service?.name ||
											`Service #${printing.printing_service_id}`}
									</p>
									{printing.notes && (
										<p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
											{printing.notes}
										</p>
									)}
								</div>
							</div>
							{/* Stats */}
							<div className="flex items-center justify-between border-t border-dashed px-3 py-2 md:px-4 md:py-3">
								<div>
									<p className="text-[10px] text-muted-foreground md:text-xs">Qty</p>
									<p className="font-medium text-xs md:text-sm">{printing.quantity}</p>
								</div>
								<div className="text-center">
									<p className="text-[10px] text-muted-foreground md:text-xs">Price</p>
									<p className="font-medium text-xs md:text-sm">RM {Number(printing.agreed_price).toFixed(2)}</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] text-muted-foreground md:text-xs">Total</p>
									<p className="font-semibold text-violet-600 text-xs md:text-sm">RM {total.toFixed(2)}</p>
								</div>
							</div>
							{/* File Reference */}
							{printing.file_reference && (
								<div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-1.5 md:px-4 md:py-2">
									<FileText className="h-3 w-3 shrink-0 text-muted-foreground md:h-3.5 md:w-3.5" />
									<span className="truncate text-[10px] text-muted-foreground md:text-xs">
										{printing.file_reference}
									</span>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between rounded-none border-2 border-dashed bg-muted/30 p-3 md:p-4">
				<div className="flex items-center gap-2">
					<Printer className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
					<span className="font-medium text-xs md:text-sm">{printings.length} service{printings.length !== 1 ? "s" : ""}</span>
				</div>
				<div className="text-right">
					<p className="text-muted-foreground text-xs md:text-sm">Subtotal</p>
					<p className="font-bold text-lg md:text-xl">RM {subtotal.toFixed(2)}</p>
				</div>
			</div>
		</section>
	);
}
