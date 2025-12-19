"use client";

import { ExternalLink, Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ExhibitorKitPrinting } from "@/lib/api/exhibitor-kit/response";

function ExpandableText({ text, className }: { text: string; className?: string }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<p
					className={cn(
						"text-muted-foreground text-[10px] md:text-xs cursor-pointer hover:text-foreground transition-colors line-clamp-1",
						className
					)}
					title="Click to view full text"
				>
					{text}
				</p>
			</PopoverTrigger>
			<PopoverContent className="w-72 max-h-80 overflow-y-auto p-3">
				<p className="text-xs break-words">{text}</p>
			</PopoverContent>
		</Popover>
	);
}

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
			<div className="flex flex-col items-center justify-center py-12 md:py-16 text-muted-foreground border border-dashed p-4">
				<div className="rounded-full bg-muted p-3 md:p-4 mb-3 md:mb-4">
					<Printer className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
				</div>
				<p className="font-medium text-sm md:text-base">No printing services ordered</p>
				<p className="text-xs md:text-sm mt-1 text-center px-4">Printing orders will appear here once placed.</p>
			</div>
		);
	}

	return (
		<section className="w-full space-y-3 md:space-y-4 border border-dashed p-4">
			{/* Printings Grid - 3 columns on desktop */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
				{printings.map((printing) => {
					const total = printing.quantity * Number(printing.agreed_price);
					return (
						<div
							key={printing.id}
							className="flex flex-col rounded-none border bg-card overflow-hidden transition-colors hover:bg-accent/50"
						>
							{/* Header */}
							<div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 pb-2 md:pb-3">
								<div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-none bg-violet-500/10 text-violet-600">
									<Printer className="h-3.5 w-3.5 md:h-4 md:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium leading-tight text-xs md:text-sm">
										{printing.printing_service?.name ||
											`Service #${printing.printing_service_id}`}
									</p>
									{printing.notes && (
										<div className="mt-0.5 md:mt-1">
											<ExpandableText text={printing.notes} />
										</div>
									)}
								</div>
							</div>
							{/* Stats */}
							<div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-t border-dashed">
								<div>
									<p className="text-[10px] md:text-xs text-muted-foreground">Qty</p>
									<p className="font-medium text-xs md:text-sm">{printing.quantity}</p>
								</div>
								<div className="text-center">
									<p className="text-[10px] md:text-xs text-muted-foreground">Price</p>
									<p className="font-medium text-xs md:text-sm">RM {Number(printing.agreed_price).toFixed(2)}</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] md:text-xs text-muted-foreground">Total</p>
									<p className="font-semibold text-violet-600 text-xs md:text-sm">RM {total.toFixed(2)}</p>
								</div>
							</div>
							{/* File Reference */}
							{printing.file_reference && (
								<div className="border-t bg-muted/30 px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2">
									<ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary shrink-0" />
									<a
										href={printing.file_reference}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[10px] md:text-xs text-primary hover:underline truncate"
									>
										View File
									</a>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between rounded-none border-2 border-dashed bg-muted/30 p-3 md:p-4">
				<div className="flex items-center gap-2">
					<Printer className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
					<span className="font-medium text-xs md:text-sm">{printings.length} service{printings.length !== 1 ? "s" : ""}</span>
				</div>
				<div className="text-right">
					<p className="text-xs md:text-sm text-muted-foreground">Subtotal</p>
					<p className="text-lg md:text-xl font-bold">RM {subtotal.toFixed(2)}</p>
				</div>
			</div>
		</section>
	);
}
