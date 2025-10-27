"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormatDate } from "@/hooks/use-format-date";
import { ArrowDownLeft, ArrowUpRight, Gift } from "lucide-react";
import type { TransactionLog } from "@eventzflow-panel/api/routers/credits";

interface TransactionLogItemProps {
	log: TransactionLog;
}

export function TransactionLogItem({ log }: TransactionLogItemProps) {
	const { formatDate } = useFormatDate();
	const date = new Date(log.date);

	return (
		<Card>
			<CardContent className="p-3 sm:p-4">
				<div className="flex items-start justify-between gap-3 sm:gap-4">
					<div className="flex-1 space-y-1.5 sm:space-y-2">
						<div className="flex items-center gap-2">
							<Badge
								variant={
									log.type === "purchase"
										? "default"
										: log.type === "refund"
											? "secondary"
											: "outline"
								}
								className="text-xs capitalize"
							>
								{log.type === "purchase" && <ArrowUpRight className="mr-1 size-3" />}
								{log.type === "refund" && <ArrowDownLeft className="mr-1 size-3" />}
								{log.type === "bonus" && <Gift className="mr-1 size-3" />}
								{log.type}
							</Badge>
						</div>
						<p className="text-sm font-medium sm:text-base">{log.description}</p>
						<p className="text-muted-foreground text-xs">
							{formatDate(date)}
						</p>
					</div>
					<div className="shrink-0 text-right">
						<p
							className={`text-base font-semibold sm:text-lg ${
								log.amount > 0 ? "text-green-600" : "text-red-600"
							}`}
						>
							{log.amount > 0 ? "+" : ""}
							{log.amount}
						</p>
						<p className="text-muted-foreground text-xs">
							Bal: {log.balance.toLocaleString()}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
