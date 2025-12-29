"use client";

import { Building2, CreditCard, Package, Printer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { EventVendor } from "@/lib/api/event-vendor";
import { cn } from "@/lib/utils";
import { mergeKitItems, mergeKitPrintings } from "@/lib/utils/merge-kit-items";

function ExpandableText({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<p
					className={cn(
						"line-clamp-2 cursor-pointer text-muted-foreground text-xs transition-colors hover:text-foreground",
						className,
					)}
					title="Click to view full text"
				>
					{text}
				</p>
			</PopoverTrigger>
			<PopoverContent className="max-h-80 w-72 overflow-y-auto p-3">
				<p className="wrap-break-word text-xs">{text}</p>
			</PopoverContent>
		</Popover>
	);
}

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

	// Merge items and printings with same IDs
	const mergedItems = mergeKitItems(items);
	const mergedPrintings = mergeKitPrintings(printings);

	const _pendingRequests = customRequests.filter(
		(req) => req.status === "pending",
	).length;
	const _approvedRequests = customRequests.filter(
		(req) => req.status === "approved",
	).length;
	const _rejectedRequests = customRequests.filter(
		(req) => req.status === "rejected",
	).length;

	return (
		<div className="border-t bg-muted/30 px-3 py-3">
			<div className="grid gap-x-3 gap-y-3 text-sm md:grid-cols-2 lg:grid-cols-3">
				{/* Booth Information */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Booth Information
						</h4>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Booth Number</span>
						<span className="text-muted-foreground">{kit.booth_number || "-"}</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Type</span>
						<Badge
							variant="outline"
							className="h-5 rounded-none text-xs capitalize"
						>
							{kit.booth_type?.replace("_", " ") || "-"}
						</Badge>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Dimensions</span>
						<span className="text-muted-foreground">{kit.booth_dimensions || "-"}</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Side Walls</span>
						<span className="text-muted-foreground text-xs">
							{kit.side_wall_left_required && "Left "}
							{kit.side_wall_right_required && "Right"}
							{!kit.side_wall_left_required &&
								!kit.side_wall_right_required &&
								"-"}
						</span>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Fascia</span>
						<span className="text-muted-foreground">{kit.name_on_fascia || "-"}</span>
					</div>
					{kit.fascia_upgrade_required && (
						<Badge
							variant="secondary"
							className="mt-1 h-5 w-full justify-center rounded-none text-xs"
						>
							Fascia Upgrade
						</Badge>
					)}
				</div>

				{/* Company & PIC */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Company & PIC
						</h4>
					</div>
					<div className="py-0.5">
						<span className="mb-0.5 block font-medium text-xs">
							Company
						</span>
						<span className="text-muted-foreground text-xs">{kit.company_name || "-"}</span>
					</div>
					<div className="py-0.5">
						<span className="mb-0.5 block font-medium text-xs">
							Address
						</span>
						<span className="text-muted-foreground text-xs">{kit.company_address || "-"}</span>
					</div>
					<div className="border-t pt-1.5">
						<span className="mb-0.5 block font-medium text-xs">
							Person In Charge
						</span>
						<p className="text-muted-foreground text-xs">{kit.pic_full_name || "-"}</p>
						<p className="text-muted-foreground text-xs">
							{kit.pic_contact_number || "-"}
						</p>
						<p className="text-muted-foreground text-xs">
							{kit.pic_email_address || "-"}
						</p>
					</div>
				</div>

				{/* Payment Information */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<CreditCard className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Booth Rental Payment
						</h4>
					</div>
					<div className="flex items-center justify-between py-0.5">
						<span className="font-medium text-xs">Status</span>
						<Badge
							variant="outline"
							className={cn(
								"h-5 rounded-none font-bold text-xs capitalize",
								kit.payment_status === "paid" &&
									"border-green-500 text-green-500",
								kit.payment_status === "unpaid" &&
									"border-red-500 text-red-500",
								kit.payment_status === "waived" &&
									"border-blue-500 text-blue-500",
								kit.payment_status === "sponsored" &&
									"border-purple-500 text-purple-500",
							)}
						>
							{kit.payment_status || "unpaid"}
						</Badge>
					</div>
					<div className="flex justify-between py-0.5">
						<span className="font-medium text-xs">Amount Paid</span>
						<span className="text-muted-foreground text-xs">
							{kit.amount_paid
								? `RM ${Number(kit.amount_paid).toFixed(2)}`
								: "-"}
						</span>
					</div>
					{kit.payment_note && (
						<div className="border-t pt-1.5">
							<span className="mb-0.5 block font-medium text-xs">
								Note
							</span>
							<ExpandableText text={kit.payment_note} />
						</div>
					)}
					{kit.special_requirements && (
						<div className="border-t pt-1.5">
							<span className="mb-0.5 block font-medium text-xs">
								Special Requirements
							</span>
							<ExpandableText text={kit.special_requirements} />
						</div>
					)}
				</div>

				{/* Team Members */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center justify-between border-b pb-1.5">
						<div className="flex items-center gap-1.5">
							<Users className="size-3.5 text-primary" />
							<h4 className="font-semibold text-xs uppercase tracking-wide">
								Team Members ({teamMembers.length})
							</h4>
						</div>
						{kit.team_member_limit && (
							<span className="text-xs">
								<span className="font-medium">Limit</span>{" "}
								<span className="text-muted-foreground">{kit.team_member_limit}</span>
							</span>
						)}
					</div>
					{teamMembers.length > 0 ? (
						<>
							<div className="scrollbar-thin scrollbar-track-transparent max-h-32 overflow-y-auto pr-2">
								{kit.team_member_limit ? (
									// Show breakdown when limit exists
									<div className="space-y-2">
										{/* Free Members */}
										<div className="space-y-0.5">
											<p className="font-medium text-green-600 text-xs dark:text-green-400">
												Free (
												{Math.min(teamMembers.length, kit.team_member_limit)})
											</p>
											{teamMembers
												.slice(0, kit.team_member_limit)
												.map((member, idx) => (
													<div
														key={member.id || idx}
														className="flex items-center gap-1.5 rounded-sm bg-green-50 px-1.5 py-0.5 dark:bg-green-950/20"
													>
														<div className="size-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
														<span className="text-xs">{member.full_name}</span>
													</div>
												))}
										</div>
										{/* Paid Members */}
										{kit.excess_team_member_count &&
											kit.excess_team_member_count > 0 && (
												<div className="space-y-0.5">
													<p className="font-medium text-amber-600 text-xs dark:text-amber-400">
														Paid ({kit.excess_team_member_count}) • RM{" "}
														{kit.extra_team_member_charges}
													</p>
													{teamMembers
														.slice(kit.team_member_limit)
														.map((member, idx) => (
															<div
																key={member.id || idx}
																className="flex items-center justify-between gap-1.5 rounded-sm bg-amber-50 px-1.5 py-0.5 dark:bg-amber-950/20"
															>
																<div className="flex min-w-0 flex-1 items-center gap-1.5">
																	<div className="size-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
																	<span className="truncate text-xs">
																		{member.full_name}
																	</span>
																</div>
																<span className="shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400">
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
											<div
												key={member.id || idx}
												className="flex items-center gap-1.5 py-0.5"
											>
												<div className="size-1.5 shrink-0 rounded-full bg-primary" />
												<span className="text-xs">{member.full_name}</span>
											</div>
										))}
									</div>
								)}
							</div>
							{/* Subtotal for extra team members */}
							{kit.extra_team_member_charges &&
								Number(kit.extra_team_member_charges) > 0 && (
									<div className="flex justify-between border-t pt-1.5 text-xs">
										<span className="font-medium">Subtotal</span>
										<span className="text-muted-foreground">
											RM {Number(kit.extra_team_member_charges).toFixed(2)}
										</span>
									</div>
								)}
						</>
					) : (
						<p className="text-muted-foreground text-xs">No team members</p>
					)}
				</div>

				{/* Ordered Items */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Package className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Ordered Items ({mergedItems.length})
						</h4>
					</div>
					{mergedItems.length > 0 ? (
						<div className="scrollbar-thin scrollbar-track-transparent max-h-32 space-y-1 overflow-y-auto pr-2">
							{mergedItems.map((item) => (
								<div
									key={item.rentable_item_id}
									className="flex items-center justify-between gap-2 border bg-muted/30 p-2"
								>
									<span className="truncate font-medium text-xs">
										{item.rentable_item?.name ||
											`Item #${item.rentable_item_id}`}
									</span>
									<Badge
										variant="secondary"
										className="h-5 shrink-0 rounded-none text-xs"
									>
										x{item.quantity}
									</Badge>
								</div>
							))}
						</div>
					) : (
						<p className="text-muted-foreground text-xs">No items ordered</p>
					)}
				</div>

				{/* Ordered Services */}
				<div className="space-y-1.5 border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Printer className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Printing Services ({mergedPrintings.length})
						</h4>
					</div>
					{mergedPrintings.length > 0 ? (
						<div className="scrollbar-thin scrollbar-track-transparent max-h-32 space-y-1 overflow-y-auto pr-2">
							{mergedPrintings.map((printing) => (
								<div
									key={printing.printing_service_id}
									className="flex items-center justify-between gap-2 border bg-muted/30 p-2"
								>
									<span className="truncate font-medium text-xs">
										{printing.printing_service?.name ||
											`Service #${printing.printing_service_id}`}
									</span>
									<Badge
										variant="secondary"
										className="h-5 shrink-0 rounded-none text-xs"
									>
										x{printing.quantity}
									</Badge>
								</div>
							))}
						</div>
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
			</div>
		</div>
	);
}
