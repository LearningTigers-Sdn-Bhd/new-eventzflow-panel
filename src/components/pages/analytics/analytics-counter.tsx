import { CheckCircle2, DollarSign, Ticket, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCounterProps {
	totalTickets?: number;
	totalScannedTickets?: number;
	totalUnscannedTickets?: number;
	totalAmountPrice?: number;
	isLoading?: boolean;
}

export function AnalyticsCounter({
	totalTickets,
	totalScannedTickets,
	totalUnscannedTickets,
	totalAmountPrice,
	isLoading = false,
}: AnalyticsCounterProps) {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	if (isLoading) {
		const skeletonKeys = [
			"total-tickets",
			"scanned-tickets",
			"unscanned-tickets",
			"total-amount",
		];

		return (
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				{skeletonKeys.map((key) => (
					<Card key={key} className="p-3 sm:p-4">
						<div className="flex items-center gap-2 sm:gap-3">
							<Skeleton className="h-8 w-8 rounded-lg" />
							<div className="min-w-0 flex-1">
								<Skeleton className="mb-2 h-3 w-16" />
								<Skeleton className="h-6 w-12" />
							</div>
						</div>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			{/* Total Tickets */}
			<Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-primary/20 p-2 sm:p-2.5">
						<Ticket className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Total Tickets
						</p>
						<p className="mt-0.5 font-bold text-xl sm:text-2xl">
							{totalTickets?.toLocaleString() || "0"}
						</p>
					</div>
				</div>
			</Card>

			{/* Scanned Tickets */}
			<Card className="border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-green-500/20 p-2 sm:p-2.5">
						<CheckCircle2 className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Scanned Tickets
						</p>
						<p className="mt-0.5 font-bold text-green-600 text-xl sm:text-2xl">
							{totalScannedTickets?.toLocaleString() || "0"}
						</p>
					</div>
				</div>
			</Card>

			{/* Unscanned Tickets */}
			<Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-orange-500/20 p-2 sm:p-2.5">
						<XCircle className="h-4 w-4 text-orange-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Unscanned Tickets
						</p>
						<p className="mt-0.5 font-bold text-orange-600 text-xl sm:text-2xl">
							{totalUnscannedTickets?.toLocaleString() || "0"}
						</p>
					</div>
				</div>
			</Card>

			{/* Total Amount */}
			<Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-3 sm:p-4">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="shrink-0 rounded-lg bg-blue-500/20 p-2 sm:p-2.5">
						<DollarSign className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-[10px] text-muted-foreground sm:text-xs">
							Total Amount
						</p>
						<p className="mt-0.5 font-bold text-blue-600 text-xl sm:text-2xl">
							{totalAmountPrice ? formatCurrency(totalAmountPrice) : "$0"}
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
