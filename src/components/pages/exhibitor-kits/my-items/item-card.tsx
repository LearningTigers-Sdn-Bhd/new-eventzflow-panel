"use client";

import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ExhibitorKitItem } from "@/lib/api/exhibitor-kit";

interface ItemCardProps {
	item: ExhibitorKitItem;
}

export function ItemCard({ item }: ItemCardProps) {
	const subtotal = item.quantity * item.agreed_price;

	return (
		<div className="group relative overflow-hidden border bg-card transition-all duration-200">
			{/* Top Accent Bar */}
			<div className="h-1 w-full bg-primary" />

			<div className="p-4">
				{/* Header: Image/Icon + Info */}
				<div className="flex flex-col gap-3">
					{/* Image/Icon Container */}
					<div className="flex h-32 w-full items-center justify-center overflow-hidden bg-primary/10">
						{item.rentable_item?.image_url ? (
							<img
								src={item.rentable_item.image_url}
								alt={item.rentable_item.name || "Item"}
								className="h-full w-full object-cover"
							/>
						) : (
							<ImageIcon className="h-10 w-10 text-primary" />
						)}
					</div>

					{/* Info */}
					<div className="space-y-2">
						<div className="flex items-start justify-between gap-2">
							<h3 className="font-semibold text-base leading-tight">
								{item.rentable_item?.name || "Unknown Item"}
							</h3>
							<Badge
								variant="outline"
								className="shrink-0 rounded-none text-xs"
							>
								{item.rentable_item?.unit_of_measure || "-"}
							</Badge>
						</div>

						{/* Quantity & Price */}
						<div className="grid grid-cols-2 gap-3 text-sm">
							<div>
								<p className="text-muted-foreground text-xs">Quantity</p>
								<p className="font-medium">{item.quantity}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Unit Price</p>
								<p className="font-medium">
									{new Intl.NumberFormat("en-MY", {
										style: "currency",
										currency: "MYR",
									}).format(item.agreed_price)}
								</p>
							</div>
						</div>

						{/* Subtotal */}
						<div className="border-t pt-2">
							<div className="flex items-center justify-between">
								<p className="text-muted-foreground text-sm">Subtotal</p>
								<p className="font-bold text-lg text-primary">
									{new Intl.NumberFormat("en-MY", {
										style: "currency",
										currency: "MYR",
									}).format(subtotal)}
								</p>
							</div>
						</div>

						{/* Notes */}
						{item.notes && (
							<div className="border-t pt-2">
								<Popover>
									<PopoverTrigger asChild>
										<div className="cursor-pointer">
											<p className="text-muted-foreground text-xs">Notes</p>
											<p className="line-clamp-2 text-sm transition-colors hover:text-primary">
												{item.notes}
											</p>
										</div>
									</PopoverTrigger>
									<PopoverContent className="max-h-80 w-72 overflow-y-auto p-3">
										<p className="break-words text-sm">{item.notes}</p>
									</PopoverContent>
								</Popover>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
