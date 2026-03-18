"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Building2,
	CreditCard,
	Edit,
	Package,
	Printer,
	Users,
} from "lucide-react";
import { useState } from "react";
import { PaymentList } from "@/components/pages/event-exhibitor-contractor/payment-list";
import { VerifyRejectPaymentDialog } from "@/components/pages/event-exhibitor-contractor/verify-reject-payment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById } from "@/lib/api/event";
import type { EventVendor } from "@/lib/api/event-vendor";
import type { ExhibitorKitPayment } from "@/lib/api/exhibitor-kit-payment";
import { cn } from "@/lib/utils";
import { formatCustomFieldEntries } from "@/lib/utils/custom-fields-display";
import { mergeKitItems, mergeKitPrintings } from "@/lib/utils/merge-kit-items";
import { shouldShowEmbeddedExhibitorManagementSections } from "../event/exhibitor-management-access";
import { EditExhibitorKitDialog } from "./edit-exhibitor-kit-dialog";

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
				<p className="break-words text-xs">{text}</p>
			</PopoverContent>
		</Popover>
	);
}

interface ExhibitorKitDetailsSectionProps {
	eventVendor: EventVendor;
}

export function ExhibitorKitDetailsSection({
	eventVendor,
}: ExhibitorKitDetailsSectionProps) {
	const kit = eventVendor.exhibitor_kit;
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	// Auth and payment verification state (org_owner only)
	const { user } = useAuth();
	const isOrgOwner = user?.role === "org_owner";
	const [verifyRejectOpen, setVerifyRejectOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] =
		useState<ExhibitorKitPayment | null>(null);
	const [dialogAction, setDialogAction] = useState<"verify" | "reject">(
		"verify",
	);
	const { data: event } = useQuery({
		queryKey: ["event", eventVendor.event_id],
		queryFn: () => getEventById(String(eventVendor.event_id)),
	});

	if (!kit) {
		return null;
	}

	// Payment dialog handlers (org_owner only)
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

	const items = kit.exhibitor_kit_items || [];
	const printings = kit.exhibitor_kit_printings || [];
	const teamMembers = kit.exhibitor_team_members || [];
	const customFieldsEntries = formatCustomFieldEntries(kit.custom_fields_data);

	// Merge items and printings with same IDs
	const mergedItems = mergeKitItems(items);
	const mergedPrintings = mergeKitPrintings(printings);
	const showPaidSections = shouldShowEmbeddedExhibitorManagementSections(
		user?.role,
		event,
	);

	return (
		<section className="space-y-2 border-t border-dashed">
			{/* Header */}
			<div className="flex flex-col gap-3 border-b border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
						Exhibitor Kit
					</p>
					<h2 className="font-semibold text-2xl tracking-tight">
						{kit.company_name || eventVendor.vendor.full_name}
					</h2>
					<p className="text-muted-foreground text-sm">
						Complete exhibitor kit information and orders
					</p>
				</div>
				<div className="flex items-center gap-2">
					{kit.booth_number && (
						<Badge variant="outline" className="rounded-none font-medium">
							Booth {kit.booth_number}
						</Badge>
					)}
					{kit.booth_type && (
						<Badge variant="outline" className="rounded-none capitalize">
							{kit.booth_type.replace(/_/g, " ")}
						</Badge>
					)}
					<Button
						size="sm"
						className="rounded-none"
						onClick={() => setIsEditDialogOpen(true)}
					>
						<Edit className="size-3.5" />
						Edit
					</Button>
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
								<span className="font-medium">Booth Number</span>
								<span className="text-muted-foreground">
									{kit.booth_number || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Type</span>
								<Badge variant="outline" className="rounded-none capitalize">
									{kit.booth_type?.replace(/_/g, " ") || "-"}
								</Badge>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Dimensions</span>
								<span className="text-muted-foreground">
									{kit.booth_dimensions || "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Side Walls</span>
								<span className="text-muted-foreground text-xs">
									{kit.side_wall_left_required && "Left "}
									{kit.side_wall_right_required && "Right"}
									{!kit.side_wall_left_required &&
										!kit.side_wall_right_required &&
										"-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Fascia</span>
								<span className="text-muted-foreground">
									{kit.name_on_fascia || "-"}
								</span>
							</div>
							{kit.fascia_upgrade_required && (
								<Badge
									variant="secondary"
									className="mt-2 w-full justify-center rounded-none"
								>
									Fascia Upgrade Required
								</Badge>
							)}
							{customFieldsEntries.length > 0 && (
								<div className="space-y-1 border-t pt-2">
									<div className="space-y-1">
										{customFieldsEntries.map((entry) => (
											<div key={entry.key} className="space-y-0.5 py-0.5">
												<span className="block font-medium">{entry.label}</span>
												<span className="block whitespace-pre-wrap break-words text-muted-foreground">
													{entry.value}
												</span>
											</div>
										))}
									</div>
								</div>
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
								<span className="mb-1 block font-medium">Company</span>
								<span className="text-muted-foreground">
									{kit.company_name || "-"}
								</span>
							</div>
							<div>
								<span className="mb-1 block font-medium">Address</span>
								<span className="text-muted-foreground text-sm">
									{kit.company_address || "-"}
								</span>
							</div>
							<div>
								<span className="mb-1 block font-medium">Country</span>
								<span className="text-muted-foreground text-sm">
									{kit.country || "-"}
								</span>
							</div>
							<div className="border-t pt-2">
								<span className="mb-1 block font-medium">Person In Charge</span>
								<p className="text-muted-foreground">
									{kit.pic_full_name || "-"}
								</p>
								<p className="text-muted-foreground text-sm">
									{kit.pic_contact_number || "-"}
								</p>
								<p className="text-muted-foreground text-sm">
									{kit.pic_email_address || "-"}
								</p>
							</div>
						</div>
					</div>

					{/* Payment Information */}
					<div className="space-y-3 rounded-none border bg-background p-4">
						<div className="flex items-center gap-2 border-b pb-2">
							<CreditCard className="size-4 text-primary" />
							<h3 className="font-semibold text-sm uppercase tracking-wide">
								Booth Rental Payment
							</h3>
						</div>
						<div className="space-y-2 text-sm">
							<div className="flex items-center justify-between">
								<span className="font-medium">Status</span>
								<Badge
									variant="outline"
									className={cn(
										"rounded-none font-bold capitalize",
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
							<div className="flex justify-between">
								<span className="font-medium">Amount Paid</span>
								<span className="text-muted-foreground">
									{kit.amount_paid
										? `RM ${Number(kit.amount_paid).toFixed(2)}`
										: "-"}
								</span>
							</div>
							{kit.payment_note && (
								<div className="border-t pt-2">
									<span className="mb-1 block font-medium">Note</span>
									<ExpandableText text={kit.payment_note} />
								</div>
							)}
							{kit.special_requirements && (
								<div className="border-t pt-2">
									<span className="mb-1 block font-medium">
										Special Requirements
									</span>
									<ExpandableText text={kit.special_requirements} />
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Team Members */}
				{teamMembers.length > 0 && (
					<div className="rounded-none border bg-background p-4">
						<div className="mb-3 flex items-center justify-between border-b pb-3">
							<div className="flex items-center gap-2">
								<Users className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Team Members ({teamMembers.length})
								</h3>
							</div>
							{kit.team_member_limit && (
								<div className="flex items-center gap-2 text-xs">
									<span>
										<span className="font-medium">Limit</span>{" "}
										<span className="text-muted-foreground">
											{kit.team_member_limit}
										</span>
									</span>
									{kit.has_unpaid_excess_team_members &&
										kit.extra_team_member_charges && (
											<Badge
												variant="outline"
												className="rounded-none border-amber-500 text-amber-600"
											>
												+RM {kit.extra_team_member_charges}
											</Badge>
										)}
								</div>
							)}
						</div>

						{kit.team_member_limit ? (
							// Show breakdown when limit exists
							<div className="space-y-4">
								{/* Free Team Members */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
											Free Team Members
										</p>
										<span className="font-medium text-green-600 text-xs dark:text-green-400">
											{Math.min(teamMembers.length, kit.team_member_limit)} /{" "}
											{kit.team_member_limit}
										</span>
									</div>
									<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
										{teamMembers
											.slice(0, kit.team_member_limit)
											.map((member, idx) => (
												<div
													key={member.id || idx}
													className="flex items-center gap-2 rounded-none border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20"
												>
													<div className="size-2 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
													<span className="text-sm">{member.full_name}</span>
												</div>
											))}
									</div>
								</div>

								{/* Paid Team Members */}
								{kit.excess_team_member_count != null &&
									kit.excess_team_member_count > 0 && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
													Additional Team Members (Paid)
												</p>
												<span className="font-medium text-amber-600 text-xs dark:text-amber-400">
													{kit.excess_team_member_count} × RM{" "}
													{kit.extra_team_member_fee} = RM{" "}
													{kit.extra_team_member_charges}
												</span>
											</div>
											<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
												{teamMembers
													.slice(kit.team_member_limit)
													.map((member, idx) => (
														<div
															key={member.id || idx}
															className="flex items-center gap-2 rounded-none border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20"
														>
															<div className="size-2 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
															<span className="flex-1 text-sm">
																{member.full_name}
															</span>
															<span className="shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400">
																+RM{" "}
																{Number(kit.extra_team_member_fee || 0).toFixed(
																	2,
																)}
															</span>
														</div>
													))}
											</div>
										</div>
									)}
							</div>
						) : (
							// Show simple grid when no limit
							<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
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
						)}
					</div>
				)}

				{showPaidSections && (
					<>
						<div className="rounded-none border bg-background p-4">
							<div className="mb-3 flex items-center gap-2 border-b pb-3">
								<CreditCard className="size-4 text-primary" />
								<h3 className="font-semibold text-sm uppercase tracking-wide">
									Order Payments
								</h3>
							</div>
							<PaymentList
								eventId={String(eventVendor.event_id)}
								kitId={String(kit.id)}
								currentUserId={isOrgOwner ? user?.id : undefined}
								onVerifyPayment={isOrgOwner ? handleVerifyPayment : undefined}
								onRejectPayment={isOrgOwner ? handleRejectPayment : undefined}
							/>
						</div>

						{mergedItems.length > 0 && (
							<div className="rounded-none border bg-background p-4">
								<div className="mb-3 flex items-center gap-2 border-b pb-3">
									<Package className="size-4 text-primary" />
									<h3 className="font-semibold text-sm uppercase tracking-wide">
										Ordered Items ({mergedItems.length})
									</h3>
								</div>
								<div className="scrollbar-thin scrollbar-track-transparent max-h-80 overflow-y-auto">
									<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
										{mergedItems.map((item) => (
											<div
												key={item.rentable_item_id}
												className="flex items-center justify-between gap-2 rounded-none border bg-muted/30 p-3"
											>
												<p className="truncate font-medium text-sm">
													{item.rentable_item?.name ||
														`Item #${item.rentable_item_id}`}
												</p>
												<Badge
													variant="secondary"
													className="shrink-0 rounded-none"
												>
													x{item.quantity}
												</Badge>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{mergedPrintings.length > 0 && (
							<div className="rounded-none border bg-background p-4">
								<div className="mb-3 flex items-center gap-2 border-b pb-3">
									<Printer className="size-4 text-primary" />
									<h3 className="font-semibold text-sm uppercase tracking-wide">
										Printing Services ({mergedPrintings.length})
									</h3>
								</div>
								<div className="scrollbar-thin scrollbar-track-transparent max-h-80 overflow-y-auto">
									<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
										{mergedPrintings.map((printing) => (
											<div
												key={printing.printing_service_id}
												className="flex items-center justify-between gap-2 rounded-none border bg-muted/30 p-3"
											>
												<p className="truncate font-medium text-sm">
													{printing.printing_service?.name ||
														`Service #${printing.printing_service_id}`}
												</p>
												<Badge
													variant="secondary"
													className="shrink-0 rounded-none"
												>
													x{printing.quantity}
												</Badge>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</>
				)}

				{/* HIDDEN: Custom Requests feature temporarily disabled */}
				{/* {customRequests.length > 0 && (
					<div className="rounded-none border bg-background p-4">
						<div className="mb-3 flex items-center justify-between border-b pb-3">
							<div className="flex items-center gap-2">
								<FileQuestion className="size-4 text-primary" />
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

			{/* Edit Exhibitor Kit Dialog */}
			<EditExhibitorKitDialog
				eventId={eventVendor.event_id}
				kit={kit}
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
			/>

			{/* Verify/Reject Payment Dialog (org_owner only) */}
			{isOrgOwner && (
				<VerifyRejectPaymentDialog
					open={verifyRejectOpen}
					onOpenChange={setVerifyRejectOpen}
					payment={selectedPayment}
					eventId={String(eventVendor.event_id)}
					kitId={String(kit.id)}
					action={dialogAction}
				/>
			)}
		</section>
	);
}
