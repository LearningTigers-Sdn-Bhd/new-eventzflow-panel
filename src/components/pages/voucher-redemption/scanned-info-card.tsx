"use client";

import { CheckCircle2, Gift, Loader2, Percent, Ticket, User, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { VoucherDetails, VisitorDetails } from "./types";

interface ScannedInfoCardProps {
	voucherUuid: string | null;
	visitorId: string | null;
	voucherDetails: VoucherDetails | null;
	visitorDetails: VisitorDetails | null;
	isLoadingVoucher: boolean;
	isLoadingVisitor: boolean;
	onClearVoucher?: () => void;
	onClearVisitor?: () => void;
}

export function ScannedInfoCard({
	voucherUuid,
	visitorId,
	voucherDetails,
	visitorDetails,
	isLoadingVoucher,
	isLoadingVisitor,
	onClearVoucher,
	onClearVisitor,
}: ScannedInfoCardProps) {
	if (!voucherUuid && !visitorId) return null;

	const getVoucherIcon = () => {
		if (!voucherDetails) return <Ticket className="h-4 w-4 text-green-500" />;
		
		switch (voucherDetails.voucherType) {
			case "free_item":
				return <Gift className="h-4 w-4 text-green-500" />;
			case "percentage":
				return <Percent className="h-4 w-4 text-green-500" />;
			case "fixed_amount":
				return <Wallet className="h-4 w-4 text-green-500" />;
			default:
				return <Ticket className="h-4 w-4 text-green-500" />;
		}
	};

	const getVoucherValueDisplay = () => {
		if (!voucherDetails) return null;
		
		switch (voucherDetails.voucherType) {
			case "free_item":
				return <span className="font-semibold text-green-600 text-xs">FREE ITEM</span>;
			case "percentage":
				return <span className="font-semibold text-green-600 text-xs">{voucherDetails.voucherValue}% OFF</span>;
			case "fixed_amount":
				return <span className="font-semibold text-green-600 text-xs">RM {voucherDetails.voucherValue.toFixed(2)} OFF</span>;
			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-white p-3 shadow-sm">
			<h3 className="mb-2 font-semibold text-muted-foreground text-xs">Scanned Information</h3>
			<div className="flex flex-wrap gap-2">
				{voucherUuid && (
					<div className="flex min-w-[200px] flex-1 items-center justify-between rounded-lg border bg-green-50 px-3 py-2">
						<div className="flex min-w-0 flex-1 items-center gap-2">
							{isLoadingVoucher ? (
								<Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-green-500" />
							) : (
								<div className="flex-shrink-0">{getVoucherIcon()}</div>
							)}
							<div className="flex min-w-0 flex-1 items-center gap-2">
								{isLoadingVoucher ? (
									<Skeleton className="h-4 w-24" />
								) : voucherDetails ? (
									<>
										<span className="truncate font-medium text-sm">{voucherDetails.title}</span>
										{getVoucherValueDisplay()}
									</>
								) : (
									<span className="truncate font-mono text-xs">{voucherUuid}</span>
								)}
							</div>
						</div>
						{onClearVoucher && !isLoadingVoucher && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVoucher}
								className="ml-2 h-6 w-6 flex-shrink-0 p-0"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						)}
					</div>
				)}

				{visitorId && (
					<div className="flex min-w-[200px] flex-1 items-center justify-between rounded-lg border bg-blue-50 px-3 py-2">
						<div className="flex min-w-0 flex-1 items-center gap-2">
							{isLoadingVisitor ? (
								<Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin text-blue-500" />
							) : (
								<User className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
							)}
							<div className="flex min-w-0 flex-1 items-center gap-2">
								{isLoadingVisitor ? (
									<Skeleton className="h-4 w-24" />
								) : visitorDetails ? (
									<>
										<span className="truncate font-medium text-sm">{visitorDetails.fullName}</span>
										<span className="truncate text-muted-foreground text-xs">({visitorDetails.email || visitorDetails.phone})</span>
									</>
								) : (
									<span className="truncate font-mono text-xs">{visitorId}</span>
								)}
							</div>
						</div>
						{onClearVisitor && !isLoadingVisitor && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVisitor}
								className="ml-2 h-6 w-6 flex-shrink-0 p-0"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}
