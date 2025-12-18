"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Building2,
	Users,
	Package,
	FileText,
	CreditCard,
	Printer,
	ExternalLink,
	StickyNote
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventVendors } from "@/lib/api/event-vendor";
import { cn } from "@/lib/utils";
import { PaymentList } from "./payment-list";
import { VerifyRejectPaymentDialog } from "./verify-reject-payment-dialog";
import type { ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment";

interface ExhibitorKitDetailsViewProps {
	eventId: string;
	kitId: string;
}

export function ExhibitorKitDetailsView({ eventId, kitId }: ExhibitorKitDetailsViewProps) {
	const router = useRouter();

	// Dialog states
	const [verifyRejectOpen, setVerifyRejectOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<ExhibitorKitPayment | null>(null);
	const [dialogAction, setDialogAction] = useState<"verify" | "reject">("verify");

	const {
		data: vendors,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["event", eventId, "vendors"],
		queryFn: () => getEventVendors(Number(eventId)),
	});

	// Find the exhibitor kit from the vendors data (same approach as admin)
	const exhibitorKit = vendors?.find(vendor => 
		vendor.exhibitor_kit?.id === Number(kitId)
	)?.exhibitor_kit;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading exhibitor kit details..."
				description="Please wait while we fetch the details..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load exhibitor kit"
				description="We couldn't load the exhibitor kit details. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!exhibitorKit) {
		return (
			<ErrorState
				title="Exhibitor kit not found"
				description="The exhibitor kit you're looking for doesn't exist."
			/>
		);
	}

	const vendor = vendors?.find(vendor => 
		vendor.exhibitor_kit?.id === Number(kitId)
	);
	const items = exhibitorKit.exhibitor_kit_items || [];
	const printings = exhibitorKit.exhibitor_kit_printings || [];
	const teamMembers = exhibitorKit.exhibitor_team_members || [];
	const customRequests = exhibitorKit.custom_requests || [];

	const itemsTotal = items.reduce(
		(sum, item) => sum + Number(item.agreed_price) * item.quantity,
		0,
	);
	const printingsTotal = printings.reduce(
		(sum, printing) => sum + Number(printing.agreed_price) * printing.quantity,
		0,
	);

	const pendingRequests = customRequests.filter(
		(req) => req.status === "pending",
	).length;
	const approvedRequests = customRequests.filter(
		(req) => req.status === "approved",
	).length;
	const rejectedRequests = customRequests.filter(
		(req) => req.status === "rejected",
	).length;

	// Payment dialog handlers
	const handleVerifyPayment = (payment: ExhibitorKitPayment) => {
		setSelectedPayment(payment);
		setDialogAction("verify");
		setVerifyRejectOpen(true);
	};

	const handleRejectPayment = (payment: ExhibitorKitPayment) => {
		setSelectedPayment(payment);
		setDialogAction("reject");
		setVerifyRejectOpen(true);
	};

	return (
		<div className="space-y-0">
			{/* Header Section */}
			<section className="space-y-6 border-t border-dashed">
				<div className="flex flex-col gap-3 border-b border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1">
						<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
							Exhibitor Kit Details
						</p>
						<h2 className="font-semibold text-2xl tracking-tight">
							{exhibitorKit.company_name}
						</h2>
						<p className="text-muted-foreground text-sm">
							Booth {exhibitorKit.booth_number} • {vendor?.vendor?.full_name || "Unknown Vendor"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{exhibitorKit.booth_number && (
							<Badge variant="outline" className="rounded-none font-medium">
								Booth {exhibitorKit.booth_number}
							</Badge>
						)}
						{exhibitorKit.booth_type && (
							<Badge variant="outline" className="rounded-none capitalize">
								{exhibitorKit.booth_type.replace("_", " ")}
							</Badge>
						)}
						<Badge
							variant="outline"
							className={cn(
								"rounded-none font-bold capitalize",
								exhibitorKit.payment_status === "paid" &&
									"border-green-500 text-green-500",
								exhibitorKit.payment_status === "unpaid" && 
									"border-red-500 text-red-500",
								exhibitorKit.payment_status === "waived" &&
									"border-gray-500 text-gray-500",
								exhibitorKit.payment_status === "sponsored" &&
									"border-blue-500 text-blue-500",
							)}
						>
							{exhibitorKit.payment_status || "unpaid"}
						</Badge>
					</div>
				</div>

				{/* Content Grid */}
				<div className="space-y-4 p-4">
					{/* Booth Info & Company/PIC Row */}
					<div className="grid gap-6 md:grid-cols-2">
						{/* Booth Information */}
						<div className="space-y-3 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Building2 className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Booth Information
								</h3>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Booth Number:</span>
									<span className="font-medium">{exhibitorKit.booth_number || "-"}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Type:</span>
									<Badge variant="outline" className="rounded-none capitalize">
										{exhibitorKit.booth_type?.replace("_", " ") || "-"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Dimensions:</span>
									<span className="font-medium">
										{exhibitorKit.booth_dimensions || "-"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Side Walls:</span>
									<span className="font-medium text-xs">
										{exhibitorKit.side_wall_left_required && "Left "}
										{exhibitorKit.side_wall_right_required && "Right"}
										{!exhibitorKit.side_wall_left_required &&
											!exhibitorKit.side_wall_right_required &&
											"-"}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Fascia:</span>
									<span className="font-medium">{exhibitorKit.name_on_fascia || "-"}</span>
								</div>
								{exhibitorKit.fascia_upgrade_required && (
									<Badge
										variant="secondary"
										className="mt-2 w-full justify-center rounded-none"
									>
										Fascia Upgrade Required
									</Badge>
								)}
							</div>
						</div>

						{/* Company & PIC */}
						<div className="space-y-3 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Building2 className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Company & PIC
								</h3>
							</div>
							<div className="space-y-2 text-sm">
								<div>
									<span className="mb-1 block text-muted-foreground">
										Company:
									</span>
									<span className="font-medium">{exhibitorKit.company_name || "-"}</span>
								</div>
								<div>
									<span className="mb-1 block text-muted-foreground">
										Address:
									</span>
									<span className="text-sm">{exhibitorKit.company_address || "-"}</span>
								</div>
								<div className="border-t pt-2">
									<span className="mb-1 block text-muted-foreground">
										Person In Charge:
									</span>
									<p className="font-medium">{exhibitorKit.pic_full_name || "-"}</p>
									<p className="text-muted-foreground text-sm">
										{exhibitorKit.pic_contact_number || "-"}
									</p>
									<p className="text-muted-foreground text-sm">
										{exhibitorKit.pic_email_address || "-"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Management Section - Full Width */}
					<div className="rounded-none border bg-background p-4">
						<div className="flex items-center gap-2 border-b pb-3 mb-4">
							<CreditCard className="size-4 text-primary" />
							<h3 className="font-semibold text-sm uppercase tracking-wide">
								Payment Management
							</h3>
						</div>
						<PaymentList
							eventId={eventId}
							kitId={kitId}
							onVerifyPayment={handleVerifyPayment}
							onRejectPayment={handleRejectPayment}
						/>
					</div>

					{/* Team Members */}
					{teamMembers.length > 0 && (
						<div className="rounded-none border bg-background p-4">
							<div className="mb-3 flex items-center gap-2 border-b pb-3">
								<Users className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Team Members ({teamMembers.length})
								</h3>
							</div>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
								{teamMembers.map((member, idx) => (
									<div
										key={member.id || idx}
										className="flex items-center gap-2 rounded-none border bg-muted/30 p-2"
									>
										<div className="size-2 shrink-0 rounded-full bg-primary" />
										<span className="text-sm">{member.full_name}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Ordered Items */}
					{items.length > 0 && (
						<div className="rounded-none border bg-background p-4">
							<div className="mb-3 flex items-center justify-between border-b pb-3">
								<div className="flex items-center gap-2">
									<Package className="size-4 text-primary" />
									<h3 className="font-semibold text-sm uppercase tracking-wide">
										Ordered Items ({items.length})
									</h3>
								</div>
								<span className="font-semibold text-sm">
									RM {itemsTotal.toFixed(2)}
								</span>
							</div>
							<div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent">
								<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
									{items.map((item) => (
										<div
											key={item.id}
											className="border bg-muted/30 p-3 space-y-1"
										>
											<div className="flex justify-between text-sm">
												<span className="truncate flex-1 font-medium">
													{item.rentable_item?.name ||
														`Item #${item.rentable_item_id}`}
												</span>
												<span className="font-semibold ml-2 shrink-0">
													RM {(Number(item.agreed_price) * item.quantity).toFixed(2)}
												</span>
											</div>
											<p className="text-muted-foreground text-xs">
												{item.quantity} x RM {Number(item.agreed_price).toFixed(2)}
											</p>
											{item.notes && (
												<div className="flex items-start gap-1.5 pt-1.5 border-t border-dashed">
													<StickyNote className="size-3 text-muted-foreground shrink-0 mt-0.5" />
													<p className="text-muted-foreground text-xs line-clamp-2">
														{item.notes}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Printing Services */}
					{printings.length > 0 && (
						<div className="rounded-none border bg-background p-4">
							<div className="mb-3 flex items-center justify-between border-b pb-3">
								<div className="flex items-center gap-2">
									<Printer className="size-4 text-primary" />
									<h3 className="font-semibold text-sm uppercase tracking-wide">
										Printing Services ({printings.length})
									</h3>
								</div>
								<span className="font-semibold text-sm">
									RM {printingsTotal.toFixed(2)}
								</span>
							</div>
							<div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent">
								<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
									{printings.map((printing) => (
										<div
											key={printing.id}
											className="border bg-muted/30 p-3 space-y-1"
										>
											<div className="flex justify-between text-sm">
												<span className="truncate flex-1 font-medium">
													{printing.printing_service?.name ||
														`Service #${printing.printing_service_id}`}
												</span>
												<span className="font-semibold ml-2 shrink-0">
													RM {(Number(printing.agreed_price) * printing.quantity).toFixed(2)}
												</span>
											</div>
											<p className="text-muted-foreground text-xs">
												{printing.quantity} x RM {Number(printing.agreed_price).toFixed(2)}
											</p>
											{(printing.notes || printing.file_reference) && (
												<div className="flex flex-col gap-1 pt-1.5 border-t border-dashed">
													{printing.notes && (
														<div className="flex items-start gap-1.5">
															<StickyNote className="size-3 text-muted-foreground shrink-0 mt-0.5" />
															<p className="text-muted-foreground text-xs line-clamp-2">
																{printing.notes}
															</p>
														</div>
													)}
													{printing.file_reference && (
														<div className="flex items-center gap-1.5">
															<ExternalLink className="size-3 text-primary shrink-0" />
															<a
																href={printing.file_reference}
																target="_blank"
																rel="noopener noreferrer"
																className="text-primary text-xs hover:underline truncate"
															>
																View File
															</a>
														</div>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* HIDDEN: Custom Requests feature temporarily disabled */}
					{/* {customRequests.length > 0 && (
						<div className="rounded-none border bg-background p-4">
							<div className="mb-3 flex items-center justify-between border-b pb-3">
								<div className="flex items-center gap-2">
									<FileText className="size-4 text-primary" />
									<h3 className="font-semibold text-sm uppercase tracking-wide">
										Custom Requests ({customRequests.length})
									</h3>
									{pendingRequests > 0 && (
										<Badge
											variant="outline"
											className="rounded-none border-yellow-500 text-xs text-yellow-500"
										>
											{pendingRequests} Pending
										</Badge>
									)}
									{approvedRequests > 0 && (
										<Badge
											variant="outline"
											className="rounded-none border-green-500 text-green-500 text-xs"
										>
											{approvedRequests} Approved
										</Badge>
									)}
									{rejectedRequests > 0 && (
										<Badge
											variant="outline"
											className="rounded-none border-red-500 text-red-500 text-xs"
										>
											{rejectedRequests} Rejected
										</Badge>
									)}
								</div>
								{customRequestsTotal > 0 && (
									<span className="font-semibold text-sm">
										RM {customRequestsTotal.toFixed(2)}
									</span>
								)}
							</div>
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
								{customRequests.map((request) => (
									<div
										key={request.id}
										className="space-y-2 rounded-none border bg-muted/30 p-3"
									>
										<div className="flex items-start justify-between gap-2">
											<p className="flex-1 text-sm">{request.description}</p>
											<Badge
												variant="outline"
												className={cn(
													"shrink-0 rounded-none text-xs",
													request.status === "pending" &&
														"border-yellow-500 text-yellow-500",
													request.status === "approved" &&
														"border-green-500 text-green-500",
													request.status === "rejected" &&
														"border-red-500 text-red-500",
												)}
											>
												{request.status}
											</Badge>
										</div>
										<div className="flex justify-between text-muted-foreground text-xs">
											<span>Quantity: {request.quantity}</span>
											{request.resolved_price && (
												<span className="font-medium">
													RM{" "}
													{(
														Number(request.resolved_price) * request.quantity
													).toFixed(2)}
												</span>
											)}
										</div>
										{request.response_notes && (
											<p className="border-t pt-2 text-muted-foreground text-xs">
												Response: {request.response_notes}
											</p>
										)}
									</div>
								))}
							</div>
						</div>
					)} */}

				</div>
			</section>

			{/* Dialogs */}
			<VerifyRejectPaymentDialog
				open={verifyRejectOpen}
				onOpenChange={setVerifyRejectOpen}
				payment={selectedPayment}
				eventId={eventId}
				kitId={kitId}
				action={dialogAction}
			/>
		</div>
	);
}
