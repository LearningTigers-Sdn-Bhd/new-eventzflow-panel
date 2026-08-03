"use client";

import { CheckCircle2, Clock, FileQuestion, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CustomRequest } from "@/lib/api/exhibitor-kit/response";
import { ReviewRequestDialog } from "../review-request-dialog";
import { RevokeRequestDialog } from "../revoke-request-dialog";

interface ManageKitCustomRequestsFormProps {
	customRequests: CustomRequest[];
	vendorName: string;
	vendorEmail: string;
	eventId: number;
	exhibitorKitId: number;
	boothNumber?: string;
	boothName?: string;
	onClose?: () => void;
}

const statusConfig = {
	pending: {
		label: "Pending",
		icon: Clock,
		variant: "secondary" as const,
		color: "text-yellow-600",
		bgColor: "bg-yellow-500/10",
	},
	approved: {
		label: "Approved",
		icon: CheckCircle2,
		variant: "default" as const,
		color: "text-green-600",
		bgColor: "bg-green-500/10",
	},
	rejected: {
		label: "Rejected",
		icon: XCircle,
		variant: "destructive" as const,
		color: "text-red-600",
		bgColor: "bg-red-500/10",
	},
};

export function ManageKitCustomRequestsForm({
	customRequests,
	vendorName,
	vendorEmail,
	eventId,
	exhibitorKitId,
	boothNumber = "",
	boothName = "",
}: ManageKitCustomRequestsFormProps) {
	const subtotal = customRequests
		.filter(
			(req) =>
				req.status === "approved" &&
				req.resolved_price &&
				Number(req.resolved_price) > 0,
		)
		.reduce((sum, req) => sum + req.quantity * Number(req.resolved_price), 0);

	if (customRequests.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center border border-dashed p-4 py-12 text-muted-foreground md:py-16">
				<div className="mb-3 rounded-full bg-muted p-3 md:mb-4 md:p-4">
					<FileQuestion className="h-6 w-6 opacity-50 md:h-8 md:w-8" />
				</div>
				<p className="font-medium text-sm md:text-base">No custom requests</p>
				<p className="mt-1 px-4 text-center text-xs md:text-sm">
					Custom requests will appear here once submitted.
				</p>
			</div>
		);
	}

	return (
		<section className="w-full space-y-3 border border-dashed p-4 md:space-y-4">
			{/* Requests Grid - 3 columns on desktop */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
				{customRequests.map((request) => {
					const config = statusConfig[request.status];
					const StatusIcon = config.icon;
					const total = request.resolved_price
						? request.quantity * Number(request.resolved_price)
						: null;

					const requestWithVendor = {
						...request,
						vendor_name: vendorName,
						vendor_email: vendorEmail,
						event_id: eventId,
						exhibitor_kit_id: exhibitorKitId,
						booth_number: boothNumber,
						booth_name: boothName,
					};

					return (
						<div
							key={request.id}
							className="flex flex-col overflow-hidden rounded-none border bg-card transition-colors hover:bg-accent/50"
						>
							{/* Header with Status */}
							<div className="flex items-start gap-2 p-3 pb-2 md:gap-3 md:p-4 md:pb-3">
								<div
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none md:h-9 md:w-9 ${config.bgColor} ${config.color}`}
								>
									<FileQuestion className="h-3.5 w-3.5 md:h-4 md:w-4" />
								</div>
								<div className="min-w-0 flex-1">
									<Badge
										variant={config.variant}
										className="mb-1.5 gap-1 rounded-none md:mb-2"
									>
										<StatusIcon className="h-3 w-3" />
										{config.label}
									</Badge>
									<p className="line-clamp-2 text-xs leading-tight md:text-sm">
										{request.description}
									</p>
								</div>
							</div>

							{/* Stats */}
							<div className="flex items-center justify-between border-t border-dashed px-3 py-2 md:px-4 md:py-3">
								<div>
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Qty
									</p>
									<p className="font-medium text-xs md:text-sm">
										{request.quantity}
									</p>
								</div>
								<div className="text-center">
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Price
									</p>
									<p className="font-medium text-xs md:text-sm">
										{request.resolved_price &&
										Number(request.resolved_price) > 0
											? `RM ${Number(request.resolved_price).toFixed(2)}`
											: "-"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] text-muted-foreground md:text-xs">
										Total
									</p>
									<p
										className={`font-semibold text-xs md:text-sm ${config.color}`}
									>
										{total && total > 0 ? `RM ${total.toFixed(2)}` : "-"}
									</p>
								</div>
							</div>

							{/* Response Notes */}
							{request.response_notes && (
								<div className="border-t bg-muted/30 px-3 py-2 md:px-4 md:py-2.5">
									<p className="mb-0.5 text-[10px] text-muted-foreground md:text-xs">
										Notes:
									</p>
									<p className="line-clamp-2 text-xs md:text-sm">
										{request.response_notes}
									</p>
								</div>
							)}

							{/* Actions */}
							<div className="border-t bg-muted/20 p-2 md:p-3">
								{request.status === "pending" && (
									<ReviewRequestDialog
										request={requestWithVendor}
										eventId={eventId}
										exhibitorKitId={exhibitorKitId}
									/>
								)}
								{(request.status === "approved" ||
									request.status === "rejected") && (
									<RevokeRequestDialog
										request={requestWithVendor}
										eventId={eventId}
										exhibitorKitId={exhibitorKitId}
									/>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary */}
			<div className="flex items-center justify-between rounded-none border-2 border-dashed bg-muted/30 p-3 md:p-4">
				<div className="flex items-center gap-2">
					<FileQuestion className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
					<span className="font-medium text-xs md:text-sm">
						{customRequests.length} request
						{customRequests.length !== 1 ? "s" : ""}
					</span>
				</div>
				<div className="text-right">
					<p className="text-muted-foreground text-xs md:text-sm">
						Approved Total
					</p>
					<p className="font-bold text-lg md:text-xl">
						RM {subtotal.toFixed(2)}
					</p>
				</div>
			</div>
		</section>
	);
}
