"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import type { CreditDeduction } from "@/lib/api/credits";

interface DeductionItemProps {
	deduction: CreditDeduction;
}

export function DeductionItem({ deduction }: DeductionItemProps) {
	const { formatDate } = useFormatDate();
	const date = new Date(deduction.date);

	return (
		<Card>
			<CardContent className="p-3 sm:p-4">
				<div className="flex items-start justify-between gap-3 sm:gap-4">
					<div className="flex-1 space-y-1.5 sm:space-y-2">
						<div className="flex items-center gap-2">
							<Badge
								variant={
									deduction.status === "sent"
										? "default"
										: deduction.status === "failed"
											? "destructive"
											: "secondary"
								}
								className="text-xs capitalize"
							>
								{deduction.status}
							</Badge>
						</div>
						<p className="font-medium text-sm sm:text-base">
							{deduction.event}
						</p>
						<p className="break-all font-mono text-muted-foreground text-xs sm:text-sm">
							{deduction.recipient}
						</p>
						<p className="text-muted-foreground text-xs">
							{deduction.channel} • {formatDate(date)}
						</p>
					</div>
					<div className="shrink-0 text-right">
						<p className="font-semibold text-base text-red-600 sm:text-lg">
							{deduction.credits}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
