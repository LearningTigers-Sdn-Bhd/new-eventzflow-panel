"use client";

import { Receipt, Scan, ScanFace, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { BlankCardWithButton } from "@/components/admin-ui/analytic";
import type { EventAnalytics } from "@/lib/api/dashboard/response";
import type { VoucherAnalyticsResponse } from "@/lib/api/voucher-analytics/response";

interface EventDetailsRecentScansProps {
	isTicketEvent: boolean;
	ticketAnalytics?: EventAnalytics;
	voucherAnalytics?: VoucherAnalyticsResponse;
	eventId: string;
	formatDate: (date: string) => string;
	formatCurrency: (amount?: number) => string;
}

export function EventDetailsRecentScans({
	isTicketEvent,
	ticketAnalytics,
	voucherAnalytics,
	eventId,
	formatDate,
	formatCurrency,
}: EventDetailsRecentScansProps) {
	const router = useRouter();

	if (isTicketEvent) {
		return (
			<div className="h-full">
				<BlankCardWithButton
					title="Recent Scans"
					icon={<ScanFace className="size-4" />}
					buttonLabel="View All Scan Logs"
					buttonIcon={<Scan className="h-4 w-4" />}
					onButtonClick={() => router.push(`/event/${eventId}/scanned-logs`)}
				>
					<div className="h-[250px] ps-12">
						{ticketAnalytics?.recentScans &&
						ticketAnalytics.recentScans.length > 0 ? (
							<div className="h-full overflow-y-auto border-l border-dashed">
								{ticketAnalytics.recentScans.map((scan) => (
									<div
										key={scan.id}
										className="flex items-center justify-between border-b border-dashed p-3"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
												<Users className="h-5 w-5 text-primary" />
											</div>
											<div>
												<p className="font-medium text-sm">
													{scan.ticketHolder}
												</p>
												<p className="text-muted-foreground text-xs">
													{scan.email}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium text-sm">{scan.location}</p>
											<p className="text-muted-foreground text-xs">
												{formatDate(scan.timestamp)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center text-muted-foreground">
								<Scan className="mx-auto mb-2 h-12 w-12 opacity-50" />
								<p className="text-sm">No scans yet</p>
							</div>
						)}
					</div>
				</BlankCardWithButton>
			</div>
		);
	}
	// Visitor events - show recent voucher redemptions
	const recentRedemptions =
		voucherAnalytics?.latestRedemptionTransactions?.slice(0, 10) || [];
	return (
		<div className="h-full">
			<BlankCardWithButton
				title="Recent Redemptions"
				icon={<Receipt className="size-4" />}
				buttonLabel="View All Redemptions"
				buttonIcon={<Receipt className="h-4 w-4" />}
				onButtonClick={() => router.push(`/event/${eventId}/voucher-analytics`)}
			>
				<div className="h-[250px] ps-12">
					{recentRedemptions.length > 0 ? (
						<div className="h-full overflow-y-auto border-l border-dashed">
							{recentRedemptions.map((redemption) => (
								<div
									key={redemption.id}
									className="flex items-center justify-between border-b border-dashed p-3"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<Receipt className="h-5 w-5 text-primary" />
										</div>
										<div>
											<p className="font-medium text-sm">
												{redemption.voucher_title}
											</p>
											<p className="text-muted-foreground text-xs">
												{redemption.redeemer_name || "Unknown"}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-medium text-sm">
											{formatCurrency(
												Number.parseFloat(redemption.discount_applied_value),
											)}
										</p>
										<p className="text-muted-foreground text-xs">
											{formatDate(redemption.redemption_timestamp)}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="py-8 text-center text-muted-foreground">
							<Receipt className="mx-auto mb-2 h-12 w-12 opacity-50" />
							<p className="text-sm">No redemptions yet</p>
						</div>
					)}
				</div>
			</BlankCardWithButton>
		</div>
	);
}
