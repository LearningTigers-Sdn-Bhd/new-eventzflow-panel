"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import { cn } from "@/lib/utils";
import type { VendorVoucher } from "./columns";
import { VendorVoucherActionsMenu } from "./action-menu";

interface VendorVoucherItemProps {
	voucher: VendorVoucher;
}

export function VendorVoucherItem({ voucher }: VendorVoucherItemProps) {
	const { formatDate } = useFormatDate();
	const isUnlimited = voucher.isUnlimited;
	const remaining = isUnlimited ? null : (voucher.totalRedemptionAvailable ?? 0) - voucher.redeemedCount;

	return (
		<Card className="rounded-none border-dashed">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1 space-y-3">
						{/* Title and Event */}
						<div>
							<h3 className="font-semibold text-lg">{voucher.title}</h3>
							<p className="text-sm text-muted-foreground">
								{voucher.eventName || `Event #${voucher.eventId}`}
							</p>
						</div>

						{/* Status and Type */}
						<div className="flex flex-wrap gap-2">
							<Badge
								variant={voucher.status === "active" ? "default" : "secondary"}
								className={cn(
									"rounded-none font-bold capitalize",
									voucher.status === "active" && "bg-green-500 text-white",
									voucher.status === "inactive" && "bg-gray-500 text-white",
								)}
							>
								{voucher.status}
							</Badge>
							<Badge variant="outline" className="rounded-none capitalize">
								{(voucher.voucherType || "").replace(/_/g, " ")}
							</Badge>
						</div>

						{/* Details Grid */}
						<div className="grid grid-cols-2 gap-3 text-sm">
							<div>
								<p className="text-muted-foreground">Value</p>
								<p className="font-medium">
									{voucher.voucherType === "free_item"
										? "-"
										: voucher.voucherType === "percentage"
											? `${voucher.voucherValue}%`
											: `RM ${voucher.voucherValue.toFixed(2)}`}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Quota</p>
								<p className="font-medium">
									{isUnlimited ? "Unlimited" : voucher.totalRedemptionAvailable}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground">Validity</p>
								<div className="flex flex-col">
									<span className="text-xs">
										<span className="text-muted-foreground">Start: </span>
										{formatDate(voucher.startDate)}
									</span>
									<span className="text-xs">
										<span className="text-muted-foreground">End: </span>
										{formatDate(voucher.endDate)}
									</span>
								</div>
							</div>
							<div>
								<p className="text-muted-foreground">Redemptions</p>
								<div className="flex flex-col">
									<span className="font-medium text-green-600">
										{isUnlimited ? "Unlimited" : `${remaining} left`}
									</span>
									<span className="text-xs text-muted-foreground">
										{voucher.redeemedCount} {isUnlimited ? "redeemed" : `/ ${voucher.totalRedemptionAvailable} redeemed`}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="ml-2">
						<VendorVoucherActionsMenu voucher={voucher} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
