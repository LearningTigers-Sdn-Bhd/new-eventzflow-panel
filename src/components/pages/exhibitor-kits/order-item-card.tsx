"use client";

import { ImageIcon } from "lucide-react";

interface OrderItemCardProps {
	name: string;
	quantity: number;
	price: number;
	imageUrl?: string | null;
	children?: React.ReactNode;
}

export function OrderItemCard({
	name,
	quantity,
	price,
	imageUrl,
	children,
}: OrderItemCardProps) {
	const total = quantity * price;

	return (
		<div className="space-y-3 p-4">
			<div className="flex items-start gap-3">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={name}
							className="h-full w-full object-cover"
						/>
					) : (
						<ImageIcon className="h-5 w-5 text-muted-foreground" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between">
						<div>
							<p className="font-medium">{name}</p>
							<p className="text-muted-foreground text-sm">
								{quantity} × RM {price.toFixed(2)}
							</p>
						</div>
						<p className="font-semibold">RM {total.toFixed(2)}</p>
					</div>
				</div>
			</div>
			{children}
		</div>
	);
}
