"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import type { PrintingService } from "@/lib/api/printing-service";
import { PrintingServiceActionsMenu } from "./action-menu";

interface PrintingServiceCardProps {
	service: PrintingService;
}

export function PrintingServiceCard({ service }: PrintingServiceCardProps) {
	const { formatDate } = useFormatDate();

	const formattedPrice = new Intl.NumberFormat("en-MY", {
		style: "currency",
		currency: "MYR",
	}).format(service.defaultPrice);

	return (
		<Card className="rounded-none border-primary/20 shadow-none">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold">{service.name}</h3>
							<Badge
								variant={service.status === "active" ? "default" : "secondary"}
								className="rounded-none capitalize"
							>
								{service.status}
							</Badge>
						</div>
						{service.description && (
							<p className="line-clamp-2 text-muted-foreground text-sm">
								{service.description}
							</p>
						)}
						<div className="flex flex-wrap gap-2 text-sm">
							<Badge variant="outline" className="rounded-none">
								{service.itemCategory?.name ?? "No Category"}
							</Badge>
							<span className="text-muted-foreground">
								{formattedPrice} / {service.unitOfMeasure}
							</span>
						</div>
						<p className="text-muted-foreground text-xs">
							Created: {formatDate(service.createdAt)}
						</p>
					</div>
					<PrintingServiceActionsMenu service={service} />
				</div>
			</CardContent>
		</Card>
	);
}
