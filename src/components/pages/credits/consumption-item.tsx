"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ConsumptionCharge } from "@eventzflow-panel/api/routers/credits";

interface ConsumptionItemProps {
	charge: ConsumptionCharge;
}

export function ConsumptionItem({ charge }: ConsumptionItemProps) {
	return (
		<Card>
			<CardContent className="p-3 sm:p-4">
				<div className="flex items-center justify-between gap-3">
					<div className="flex-1">
						<p className="text-sm font-medium sm:text-base">{charge.country}</p>
						<p className="font-mono text-muted-foreground text-xs sm:text-sm">
							+{charge.countryCode}
						</p>
					</div>
					<div className="shrink-0 text-right">
						<p className="text-base font-semibold sm:text-lg">
							{charge.waMessageCredits}
						</p>
						<p className="text-muted-foreground text-xs">credits</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
