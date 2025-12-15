"use client";

import { Building2, CreditCard, FileQuestion, Package, Printer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventVendor } from "@/lib/api/event-vendor";

interface KitDetailsRowProps {
	vendor: EventVendor;
	isExpanded: boolean;
}

export function KitDetailsRow({ vendor, isExpanded }: KitDetailsRowProps) {
	const kit = vendor.exhibitor_kit;

	if (!kit || !isExpanded) {
		return null;
	}

	const items = kit.exhibitor_kit_items || [];
	const printings = kit.exhibitor_kit_printings || [];
	const teamMembers = kit.exhibitor_team_members || [];
	const customRequests = kit.custom_requests || [];

	const itemsTotal = items.reduce((sum, item) => sum + (item.agreed_price * item.quantity), 0);
	const printingsTotal = printings.reduce((sum, printing) => sum + (printing.agreed_price * printing.quantity), 0);
	const customRequestsTotal = customRequests
		.filter(req => req.status === "approved")
		.reduce((sum, req) => sum + ((req.resolved_price || 0) * req.quantity), 0);
	const teamMemberCharges = kit.extra_team_member_charges ? Number(kit.extra_team_member_charges) : 0;

	// HIDDEN: Custom Requests feature temporarily disabled - removed customRequestsTotal from calculation
	const grandTotal = itemsTotal + printingsTotal + teamMemberCharges;

	const pendingRequests = customRequests.filter(req => req.status === "pending").length;
	const approvedRequests = customRequests.filter(req => req.status === "approved").length;
	const rejectedRequests = customRequests.filter(req => req.status === "rejected").length;

	return (
		<div className="border-t bg-muted/30 px-3 py-3">
			<div className="grid gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-3 text-sm">
				{/* Booth Information */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Booth Information
						</h4>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Booth Number:</span>
						<span className="font-medium">{kit.booth_number || "-"}</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Type:</span>
						<Badge variant="outline" className="rounded-none capitalize h-5 text-xs">
							{kit.booth_type?.replace("_", " ") || "-"}
						</Badge>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Dimensions:</span>
						<span className="font-medium">{kit.booth_dimensions || "-"}</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Side Walls:</span>
						<span className="font-medium text-xs">
							{kit.side_wall_left_required && "Left "}
							{kit.side_wall_right_required && "Right"}
							{!kit.side_wall_left_required && !kit.side_wall_right_required && "-"}
						</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Fascia:</span>
						<span className="font-medium">{kit.name_on_fascia || "-"}</span>
					</div>
					{kit.fascia_upgrade_required && (
						<Badge variant="secondary" className="rounded-none w-full justify-center h-5 text-xs mt-1">
							Fascia Upgrade
						</Badge>
					)}
				</div>

				{/* Company & PIC */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Company & PIC
						</h4>
					</div>
					<div className="py-0.5">
						<span className="text-muted-foreground text-xs block mb-0.5">Company:</span>
						<span className="font-medium">{kit.company_name || "-"}</span>
					</div>
					<div className="py-0.5">
						<span className="text-muted-foreground text-xs block mb-0.5">Address:</span>
						<span className="text-xs">{kit.company_address || "-"}</span>
					</div>
					<div className="pt-1.5 border-t">
						<span className="text-muted-foreground text-xs block mb-0.5">Person In Charge:</span>
						<p className="font-medium">{kit.pic_full_name || "-"}</p>
						<p className="text-xs text-muted-foreground">{kit.pic_contact_number || "-"}</p>
						<p className="text-xs text-muted-foreground">{kit.pic_email_address || "-"}</p>
					</div>
				</div>

				{/* Payment Information */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b">
						<CreditCard className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Payment
						</h4>
					</div>
					<div className="flex justify-between items-center py-0.5">
						<span className="text-muted-foreground text-xs">Status:</span>
						<Badge
							variant="outline"
							className={cn(
								"rounded-none font-bold capitalize h-5 text-xs",
								kit.payment_status === "paid" && "border-green-500 text-green-500",
								kit.payment_status === "unpaid" && "border-red-500 text-red-500",
								kit.payment_status === "waived" && "border-blue-500 text-blue-500",
								kit.payment_status === "sponsored" && "border-purple-500 text-purple-500",
							)}
						>
							{kit.payment_status || "unpaid"}
						</Badge>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="text-muted-foreground text-xs">Amount Paid:</span>
						<span className="font-medium">
							{kit.amount_paid ? `RM ${Number(kit.amount_paid).toFixed(2)}` : "-"}
						</span>
					</div>
					{kit.payment_note && (
						<div className="pt-1.5 border-t">
							<span className="text-muted-foreground text-xs block mb-0.5">Note:</span>
							<p className="text-xs">{kit.payment_note}</p>
						</div>
					)}
					{kit.special_requirements && (
						<div className="pt-1.5 border-t">
							<span className="text-muted-foreground text-xs block mb-0.5">Special Requirements:</span>
							<p className="text-xs">{kit.special_requirements}</p>
						</div>
					)}
				</div>

				{/* Team Members */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center justify-between mb-2 pb-1.5 border-b">
						<div className="flex items-center gap-1.5">
							<Users className="size-3.5 text-primary" />
							<h4 className="font-semibold text-xs uppercase tracking-wide">
								Team Members ({teamMembers.length})
							</h4>
						</div>
						{kit.team_member_limit && (
							<span className="text-xs text-muted-foreground">
								Limit: {kit.team_member_limit}
							</span>
						)}
					</div>
					{teamMembers.length > 0 ? (
						kit.team_member_limit ? (
							// Show breakdown when limit exists
							<div className="space-y-2">
								{/* Free Members */}
								<div className="space-y-0.5">
									<p className="text-xs font-medium text-green-600 dark:text-green-400">
										Free ({Math.min(teamMembers.length, kit.team_member_limit)})
									</p>
									{teamMembers.slice(0, kit.team_member_limit).map((member, idx) => (
										<div key={member.id || idx} className="flex items-center gap-1.5 py-0.5 bg-green-50 dark:bg-green-950/20 px-1.5 rounded-sm">
											<div className="size-1.5 rounded-full bg-green-600 dark:bg-green-400 shrink-0" />
											<span className="text-xs">{member.full_name}</span>
										</div>
									))}
								</div>
								{/* Paid Members */}
								{kit.excess_team_member_count && kit.excess_team_member_count > 0 && (
									<div className="space-y-0.5">
										<p className="text-xs font-medium text-amber-600 dark:text-amber-400">
											Paid ({kit.excess_team_member_count}) • RM {kit.extra_team_member_charges}
										</p>
										{teamMembers.slice(kit.team_member_limit).map((member, idx) => (
											<div key={member.id || idx} className="flex items-center justify-between gap-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 px-1.5 rounded-sm">
												<div className="flex items-center gap-1.5 flex-1 min-w-0">
													<div className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400 shrink-0" />
													<span className="text-xs truncate">{member.full_name}</span>
												</div>
												<span className="text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
													+RM {kit.extra_team_member_fee}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						) : (
							// Show simple list when no limit
							<div className="space-y-0.5">
								{teamMembers.map((member, idx) => (
									<div key={member.id || idx} className="flex items-center gap-1.5 py-0.5">
										<div className="size-1.5 rounded-full bg-primary shrink-0" />
										<span className="text-xs">{member.full_name}</span>
									</div>
								))}
							</div>
						)
					) : (
						<p className="text-muted-foreground text-xs">No team members</p>
					)}
				</div>

				{/* Ordered Items */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b">
						<Package className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Ordered Items ({items.length})
						</h4>
					</div>
					{items.length > 0 ? (
						<>
							<div className="space-y-0.5 max-h-28 overflow-y-auto">
								{items.map((item) => (
									<div key={item.id} className="flex justify-between text-xs py-0.5 border-b border-dashed">
										<span className="truncate flex-1">
											{item.rentable_item?.name || `Item #${item.rentable_item_id}`}
										</span>
										<span className="text-muted-foreground ml-2">{item.quantity}x</span>
										<span className="font-medium ml-2">
											RM {(item.agreed_price * item.quantity).toFixed(2)}
										</span>
									</div>
								))}
							</div>
							<div className="flex justify-between pt-1.5 border-t font-semibold text-xs">
								<span>Subtotal:</span>
								<span>RM {itemsTotal.toFixed(2)}</span>
							</div>
						</>
					) : (
						<p className="text-muted-foreground text-xs">No items ordered</p>
					)}
				</div>

				{/* Ordered Services */}
				<div className="space-y-1.5 border p-3 bg-background">
					<div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b">
						<Printer className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Printing Services ({printings.length})
						</h4>
					</div>
					{printings.length > 0 ? (
						<>
							<div className="space-y-0.5 max-h-28 overflow-y-auto">
								{printings.map((printing) => (
									<div key={printing.id} className="flex justify-between text-xs py-0.5 border-b border-dashed">
										<span className="truncate flex-1">
											{printing.printing_service?.name || `Service #${printing.printing_service_id}`}
										</span>
										<span className="text-muted-foreground ml-2">{printing.quantity}x</span>
										<span className="font-medium ml-2">
											RM {(printing.agreed_price * printing.quantity).toFixed(2)}
										</span>
									</div>
								))}
							</div>
							<div className="flex justify-between pt-1.5 border-t font-semibold text-xs">
								<span>Subtotal:</span>
								<span>RM {printingsTotal.toFixed(2)}</span>
							</div>
						</>
					) : (
						<p className="text-muted-foreground text-xs">No services ordered</p>
					)}
				</div>

				{/* HIDDEN: Custom Requests feature temporarily disabled */}
				{/* {customRequests.length > 0 && (
					<div className="space-y-1.5 md:col-span-2 lg:col-span-3 border p-3 bg-background">
						<div className="flex items-center gap-2 mb-2 pb-1.5 border-b">
							<FileQuestion className="size-3.5 text-primary" />
							<h4 className="font-semibold text-xs uppercase tracking-wide">
								Custom Requests ({customRequests.length})
							</h4>
							{pendingRequests > 0 && (
								<Badge variant="outline" className="rounded-none text-xs border-yellow-500 text-yellow-500 h-5">
									{pendingRequests} Pending
								</Badge>
							)}
							{approvedRequests > 0 && (
								<Badge variant="outline" className="rounded-none text-xs border-green-500 text-green-500 h-5">
									{approvedRequests} Approved
								</Badge>
							)}
							{rejectedRequests > 0 && (
								<Badge variant="outline" className="rounded-none text-xs border-red-500 text-red-500 h-5">
									{rejectedRequests} Rejected
								</Badge>
							)}
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
							{customRequests.map((request) => (
								<div key={request.id} className="border rounded-sm p-2 space-y-1 bg-muted/30">
									<div className="flex justify-between items-start gap-2">
										<p className="text-xs flex-1 line-clamp-2">{request.description}</p>
										<Badge
											variant="outline"
											className={cn(
												"rounded-none text-xs shrink-0 h-5",
												request.status === "pending" && "border-yellow-500 text-yellow-500",
												request.status === "approved" && "border-green-500 text-green-500",
												request.status === "rejected" && "border-red-500 text-red-500",
											)}
										>
											{request.status}
										</Badge>
									</div>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>Qty: {request.quantity}</span>
										{request.resolved_price && (
											<span className="font-medium">
												RM {(request.resolved_price * request.quantity).toFixed(2)}
											</span>
										)}
									</div>
									{request.response_notes && (
										<p className="text-xs text-muted-foreground border-t pt-1 line-clamp-2">
											Response: {request.response_notes}
										</p>
									)}
								</div>
							))}
						</div>
						{customRequestsTotal > 0 && (
							<div className="flex justify-between pt-1.5 border-t font-semibold text-xs">
								<span>Approved Total:</span>
								<span>RM {customRequestsTotal.toFixed(2)}</span>
							</div>
						)}
					</div>
				)} */}

				{/* Grand Total - Full Width */}
				{grandTotal > 0 && (
					<div className="md:col-span-2 lg:col-span-3 border-2 border-primary/30 p-3 bg-primary/5">
						<div className="flex justify-between items-center">
							<div>
								<h4 className="font-bold text-base">Grand Total:</h4>
								<div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
									{itemsTotal > 0 && <span>Items: RM {itemsTotal.toFixed(2)}</span>}
									{printingsTotal > 0 && <span>• Services: RM {printingsTotal.toFixed(2)}</span>}
									{/* HIDDEN: Custom Requests feature temporarily disabled */}
									{/* {customRequestsTotal > 0 && <span>• Requests: RM {customRequestsTotal.toFixed(2)}</span>} */}
									{teamMemberCharges > 0 && (
										<span className="font-medium text-amber-600">
											• Team: RM {teamMemberCharges.toFixed(2)}
										</span>
									)}
								</div>
							</div>
							<span className="font-bold text-2xl text-primary">RM {grandTotal.toFixed(2)}</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
