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
			<h3 className="mb-2 font-semibold text-xs text-muted-foreground">Scanned Information</h3>
			<div className="flex flex-wrap gap-2">
				{voucherUuid && (
					<div className="flex items-center justify-between rounded-lg border bg-green-50 px-3 py-2 flex-1 min-w-[200px]">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							{isLoadingVoucher ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin text-green-500 flex-shrink-0" />
							) : (
								<div className="flex-shrink-0">{getVoucherIcon()}</div>
							)}
							<div className="flex items-center gap-2 flex-1 min-w-0">
								{isLoadingVoucher ? (
									<Skeleton className="h-4 w-24" />
								) : voucherDetails ? (
									<>
										<span className="font-medium text-sm truncate">{voucherDetails.title}</span>
										{getVoucherValueDisplay()}
									</>
								) : (
									<span className="font-mono text-xs truncate">{voucherUuid}</span>
								)}
							</div>
						</div>
						{onClearVoucher && !isLoadingVoucher && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVoucher}
								className="h-6 w-6 p-0 flex-shrink-0 ml-2"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						)}
					</div>
				)}

				{visitorId && (
					<div className="flex items-center justify-between rounded-lg border bg-blue-50 px-3 py-2 flex-1 min-w-[200px]">
						<div className="flex items-center gap-2 flex-1 min-w-0">
							{isLoadingVisitor ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 flex-shrink-0" />
							) : (
								<User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
							)}
							<div className="flex items-center gap-2 flex-1 min-w-0">
								{isLoadingVisitor ? (
									<Skeleton className="h-4 w-24" />
								) : visitorDetails ? (
									<>
										<span className="font-medium text-sm truncate">{visitorDetails.fullName}</span>
										<span className="text-muted-foreground text-xs truncate">({visitorDetails.email || visitorDetails.phone})</span>
									</>
								) : (
									<span className="font-mono text-xs truncate">{visitorId}</span>
								)}
							</div>
						</div>
						{onClearVisitor && !isLoadingVisitor && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVisitor}
								className="h-6 w-6 p-0 flex-shrink-0 ml-2"
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
