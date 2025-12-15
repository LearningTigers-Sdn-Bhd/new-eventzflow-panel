"use client";

import { useQuery } from "@tanstack/react-query";
import { 
	Building2, 
	Users, 
	Package, 
	FileText, 
	CreditCard,
	Printer
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventVendors } from "@/lib/api/event-vendor";
import { cn } from "@/lib/utils";

interface ExhibitorKitDetailsViewProps {
	eventId: string;
	kitId: string;
}

export function ExhibitorKitDetailsView({ eventId, kitId }: ExhibitorKitDetailsViewProps) {
	const router = useRouter();

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
	const customRequestsTotal = customRequests
		.filter((req) => req.status === "approved")
		.reduce(
			(sum, req) => sum + Number(req.resolved_price || 0) * req.quantity,
			0,
		);

	// HIDDEN: Custom Requests feature temporarily disabled - removed customRequestsTotal from calculation
	const grandTotal = itemsTotal + printingsTotal;

	const pendingRequests = customRequests.filter(
		(req) => req.status === "pending",
	).length;
	const approvedRequests = customRequests.filter(
		(req) => req.status === "approved",
	).length;
	const rejectedRequests = customRequests.filter(
		(req) => req.status === "rejected",
	).length;

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
					{/* Basic Information Grid */}
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

						{/* Payment Information */}
						<div className="space-y-3 rounded-none border bg-background p-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<CreditCard className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Payment
								</h3>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Status:</span>
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
								<div className="flex justify-between">
									<span className="text-muted-foreground">Amount Paid:</span>
									<span className="font-medium">
										{exhibitorKit.amount_paid
											? `RM ${Number(exhibitorKit.amount_paid).toFixed(2)}`
											: "-"}
									</span>
								</div>
								{exhibitorKit.payment_note && (
									<div className="border-t pt-2">
										<span className="mb-1 block text-muted-foreground">
											Note:
										</span>
										<p className="text-sm">{exhibitorKit.payment_note}</p>
									</div>
								)}
								{exhibitorKit.special_requirements && (
									<div className="border-t pt-2">
										<span className="mb-1 block text-muted-foreground">
											Special Requirements:
										</span>
										<p className="text-sm">{exhibitorKit.special_requirements}</p>
									</div>
								)}
							</div>
						</div>
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
							<div className="space-y-1">
								{items.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between border-b border-dashed py-2 last:border-0"
									>
										<div className="flex-1">
											<p className="font-medium text-sm">
												{item.rentable_item?.name ||
													`Item #${item.rentable_item_id}`}
											</p>
											<p className="text-muted-foreground text-xs">
												{item.quantity} x RM{" "}
												{Number(item.agreed_price).toFixed(2)}
											</p>
											{item.notes && (
												<p className="text-muted-foreground text-xs mt-1">
													Note: {item.notes}
												</p>
											)}
										</div>
										<span className="font-semibold">
											RM {(Number(item.agreed_price) * item.quantity).toFixed(2)}
										</span>
									</div>
								))}
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
							<div className="space-y-1">
								{printings.map((printing) => (
									<div
										key={printing.id}
										className="flex items-center justify-between border-b border-dashed py-2 last:border-0"
									>
										<div className="flex-1">
											<p className="font-medium text-sm">
												{printing.printing_service?.name ||
													`Service #${printing.printing_service_id}`}
											</p>
											<p className="text-muted-foreground text-xs">
												{printing.quantity} x RM{" "}
												{Number(printing.agreed_price).toFixed(2)}
											</p>
											{printing.file_reference && (
												<p className="text-muted-foreground text-xs mt-1">
													File: {printing.file_reference}
												</p>
											)}
											{printing.notes && (
												<p className="text-muted-foreground text-xs mt-1">
													Note: {printing.notes}
												</p>
											)}
										</div>
										<span className="font-semibold">
											RM{" "}
											{(
												Number(printing.agreed_price) * printing.quantity
											).toFixed(2)}
										</span>
									</div>
								))}
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

					{/* Grand Total */}
					{grandTotal > 0 && (
						<div className="rounded-none border-2 border-primary/30 bg-primary/5 p-4">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-lg">
									Grand Total (Items + Services + Approved Requests):
								</h3>
								<span className="font-bold text-3xl text-primary">
									RM {grandTotal.toFixed(2)}
								</span>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
