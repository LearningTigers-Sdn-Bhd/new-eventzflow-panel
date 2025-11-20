"use client";

import { CheckCircle2, Ticket, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ScannedInfoCardProps {
	voucherUuid: string | null;
	visitorId: string | null;
	onClearVoucher?: () => void;
	onClearVisitor?: () => void;
}

export function ScannedInfoCard({
	voucherUuid,
	visitorId,
	onClearVoucher,
	onClearVisitor,
}: ScannedInfoCardProps) {
	if (!voucherUuid && !visitorId) return null;

	return (
		<Card className="overflow-hidden rounded-lg border-primary/20 bg-white p-4 shadow-sm">
			<h3 className="mb-3 font-semibold text-sm">Scanned Information</h3>
			<div className="space-y-2">
				{voucherUuid && (
					<div className="flex items-center justify-between rounded-lg border bg-green-50 p-3">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-green-500" />
							<div className="flex flex-col">
								<span className="text-muted-foreground text-xs">Voucher</span>
								<span className="font-mono text-sm">{voucherUuid}</span>
							</div>
						</div>
						{onClearVoucher && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVoucher}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				)}

				{visitorId && (
					<div className="flex items-center justify-between rounded-lg border bg-blue-50 p-3">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-blue-500" />
							<div className="flex flex-col">
								<span className="text-muted-foreground text-xs">Visitor</span>
								<span className="font-mono text-sm">{visitorId}</span>
							</div>
						</div>
						{onClearVisitor && (
							<Button
								variant="ghost"
								size="sm"
								onClick={onClearVisitor}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}
