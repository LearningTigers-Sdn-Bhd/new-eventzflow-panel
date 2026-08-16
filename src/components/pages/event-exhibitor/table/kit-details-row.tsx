"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, CreditCard, Package, Printer, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/auth/use-auth";
import { getEventById } from "@/lib/api/event";
import type { EventVendor } from "@/lib/api/event-vendor";
import type { ExhibitorKit } from "@/lib/api/exhibitor-kit";
import { cn } from "@/lib/utils";
import { formatCustomFieldEntries } from "@/lib/utils/custom-fields-display";
import { mergeKitItems, mergeKitPrintings } from "@/lib/utils/merge-kit-items";
import {
	shouldExpandEmbeddedTeamMembersSection,
	shouldShowEmbeddedExhibitorManagementSections,
} from "../../event/exhibitor-management-access";
import { IcCopyPreviewButton } from "../ic-copy-preview-button";
import { PaymentProofPreviewButton } from "../payment-proof-preview-button";

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
	kit: ExhibitorKit;
	isExpanded: boolean;
	batchSize?: number;
}

export function KitDetailsRow({
	vendor,
	kit,
	isExpanded,
	batchSize,
}: KitDetailsRowProps) {
	const { user } = useAuth();
	const { data: event } = useQuery({
		queryKey: ["event", vendor.event_id],
		queryFn: () => getEventById(String(vendor.event_id)),
		enabled: isExpanded && !!kit,
	});

	if (!isExpanded) {
		return null;
	}

	const items = kit.exhibitor_kit_items || [];
	const printings = kit.exhibitor_kit_printings || [];
	const teamMembers = kit.exhibitor_team_members || [];
	const customFieldsEntries = formatCustomFieldEntries(kit.custom_fields_data);
	const mergedItems = mergeKitItems(items);
	const mergedPrintings = mergeKitPrintings(printings);
	const showPaidSections = shouldShowEmbeddedExhibitorManagementSections(
		user?.role,
		event,
	);
	const expandTeamMembersSection = shouldExpandEmbeddedTeamMembersSection(
		user?.role,
		event,
	);

	const teamMembersContent = (
		<>
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
						<span className="text-muted-foreground">
							{kit.team_member_limit}
						</span>
					</span>
				)}
			</div>

			{teamMembers.length > 0 ? (
				kit.team_member_limit ? (
					<div className="space-y-4">
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
							<div
								className={cn(
									expandTeamMembersSection
										? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
										: "space-y-0.5",
								)}
							>
								{teamMembers
									.slice(0, kit.team_member_limit)
									.map((member, idx) => (
										<div
											key={member.id || idx}
											className={cn(
												expandTeamMembersSection
													? "flex items-center gap-2 rounded-none border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/20"
													: "flex items-center gap-1.5 rounded-sm bg-green-50 px-1.5 py-0.5 dark:bg-green-950/20",
											)}
										>
											<div className="size-2 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
											<span
												className={cn(
													expandTeamMembersSection ? "text-sm" : "text-xs",
												)}
											>
												{member.full_name}
											</span>
										</div>
									))}
							</div>
						</div>

						{kit.excess_team_member_count != null &&
							kit.excess_team_member_count > 0 && (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
											Additional Team Members (Paid)
										</p>
										<span className="font-medium text-amber-600 text-xs dark:text-amber-400">
											{kit.excess_team_member_count} x RM{" "}
											{Number(kit.extra_team_member_fee || 0).toFixed(2)} = RM{" "}
											{Number(kit.extra_team_member_charges || 0).toFixed(2)}
										</span>
									</div>
									<div
										className={cn(
											expandTeamMembersSection
												? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
												: "space-y-0.5",
										)}
									>
										{teamMembers
											.slice(kit.team_member_limit)
											.map((member, idx) => (
												<div
													key={member.id || idx}
													className={cn(
														expandTeamMembersSection
															? "flex items-center justify-between gap-2 rounded-none border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20"
															: "flex items-center justify-between gap-1.5 rounded-sm bg-amber-50 px-1.5 py-0.5 dark:bg-amber-950/20",
													)}
												>
													<div className="flex min-w-0 flex-1 items-center gap-1.5">
														<div className="size-2 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
														<span
															className={cn(
																"truncate",
																expandTeamMembersSection
																	? "text-sm"
																	: "text-xs",
															)}
														>
															{member.full_name}
														</span>
													</div>
													<span className="shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400">
														+RM{" "}
														{Number(kit.extra_team_member_fee || 0).toFixed(2)}
													</span>
												</div>
											))}
									</div>
								</div>
							)}
					</div>
				) : (
					<div
						className={cn(
							expandTeamMembersSection
								? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
								: "space-y-0.5",
						)}
					>
						{teamMembers.map((member, idx) => (
							<div
								key={member.id || idx}
								className={cn(
									expandTeamMembersSection
										? "flex items-center gap-2 rounded-none border bg-muted/30 p-2"
										: "flex items-center gap-1.5 py-0.5",
								)}
							>
								<div className="size-2 shrink-0 rounded-full bg-primary" />
								<span
									className={cn(
										expandTeamMembersSection ? "text-sm" : "text-xs",
									)}
								>
									{member.full_name}
								</span>
							</div>
						))}
					</div>
				)
			) : (
				<p className="text-muted-foreground text-xs">No team members</p>
			)}
		</>
	);

	return (
		<div className="border-t bg-muted/30 px-3 py-3">
			<div className="grid min-w-0 gap-x-3 gap-y-3 text-sm md:grid-cols-2 lg:grid-cols-3">
				<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Booth Information
						</h4>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Booth Number</span>
						<span className="break-words text-right text-muted-foreground">
							{kit.booth_number || "-"}
						</span>
					</div>
					{kit.booking_batch_id && (
						<Badge
							variant="secondary"
							className="h-5 w-full justify-center rounded-none text-xs"
						>
							{batchSize && batchSize > 1
								? `Batch of ${batchSize}`
								: "Bulk registration batch"}
						</Badge>
					)}
					<div className="flex items-center justify-between gap-2 py-0.5">
						<span className="font-medium text-xs">IC Copy</span>
						<IcCopyPreviewButton
							eventId={vendor.event_id}
							kitId={kit.id}
							available={kit.ic_copy_uploaded}
						/>
					</div>
					<div className="flex items-center justify-between gap-2 py-0.5">
						<span className="font-medium text-xs">Customs Declaration</span>
						<IcCopyPreviewButton
							eventId={vendor.event_id}
							kitId={kit.id}
							available={kit.customs_declaration_uploaded}
							document="customs-declaration"
						/>
					</div>
					<div className="flex items-center justify-between gap-2 py-0.5">
						<span className="font-medium text-xs">Customs Duty Estimate</span>
						<IcCopyPreviewButton
							eventId={vendor.event_id}
							kitId={kit.id}
							available={kit.customs_duty_estimate_uploaded}
							document="customs-duty-estimate"
							boothNumber={kit.booth_number}
						/>
					</div>
					<div className="flex items-center justify-between gap-2 py-0.5">
						<span className="font-medium text-xs">Indemnity Form</span>
						<IcCopyPreviewButton
							eventId={vendor.event_id}
							kitId={kit.id}
							available={kit.indemnity_form_uploaded}
							document="indemnity-form"
							boothNumber={kit.booth_number}
						/>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Type</span>
						<Badge
							variant="outline"
							className="h-5 shrink-0 rounded-none text-xs capitalize"
						>
							{kit.booth_type?.replace(/_/g, " ") || "-"}
						</Badge>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Dimensions</span>
						<span className="break-words text-right text-muted-foreground">
							{kit.booth_dimensions || "-"}
						</span>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Side Walls</span>
						<span className="break-words text-right text-muted-foreground text-xs">
							{kit.side_wall_left_required && "Left "}
							{kit.side_wall_right_required && "Right"}
							{!kit.side_wall_left_required &&
								!kit.side_wall_right_required &&
								"-"}
						</span>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Fascia</span>
						<span className="break-words text-right text-muted-foreground">
							{kit.name_on_fascia || "-"}
						</span>
					</div>
					{kit.fascia_upgrade_required && (
						<Badge
							variant="secondary"
							className="mt-1 h-5 w-full justify-center rounded-none text-xs"
						>
							Fascia Upgrade
						</Badge>
					)}
					{customFieldsEntries.length > 0 && (
						<div className="space-y-1 border-t pt-2">
							<div className="space-y-1">
								{customFieldsEntries.map((entry) => (
									<div key={entry.key} className="space-y-0.5 py-0.5 text-xs">
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

				<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<Building2 className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Company & PIC
						</h4>
					</div>
					<div className="py-0.5">
						<span className="mb-0.5 block font-medium text-xs">Company</span>
						<span className="block break-words text-muted-foreground text-xs">
							{kit.company_name || "-"}
						</span>
					</div>
					<div className="py-0.5">
						<span className="mb-0.5 block font-medium text-xs">Address</span>
						{kit.company_address ? (
							<span className="block whitespace-pre-wrap break-words text-muted-foreground text-xs">
								{kit.company_address}
							</span>
						) : (
							<span className="block text-muted-foreground text-xs">-</span>
						)}
					</div>
					<div className="py-0.5">
						<span className="mb-0.5 block font-medium text-xs">Country</span>
						<span className="block break-words text-muted-foreground text-xs">
							{kit.country || "-"}
						</span>
					</div>
					<div className="border-t pt-1.5">
						<span className="mb-0.5 block font-medium text-xs">
							Person In Charge
						</span>
						<p className="break-words text-muted-foreground text-xs">
							{kit.pic_full_name || "-"}
						</p>
						<p className="break-words text-muted-foreground text-xs">
							{kit.pic_contact_number || "-"}
						</p>
						<p className="break-words text-muted-foreground text-xs">
							{kit.pic_email_address || "-"}
						</p>
					</div>
				</div>

				<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
					<div className="mb-2 flex items-center gap-1.5 border-b pb-1.5">
						<CreditCard className="size-3.5 text-primary" />
						<h4 className="font-semibold text-xs uppercase tracking-wide">
							Booth Rental Payment
						</h4>
					</div>
					<div className="flex items-center justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Status</span>
						<Badge
							variant="outline"
							className={cn(
								"h-5 shrink-0 rounded-none font-bold text-xs capitalize",
								kit.payment_status === "paid" &&
									"border-green-500 text-green-500",
								kit.payment_status === "unpaid" &&
									"border-red-500 text-red-500",
								kit.payment_status === "waived" &&
									"border-blue-500 text-blue-500",
								kit.payment_status === "sponsored" &&
									"border-purple-500 text-purple-500",
								kit.payment_status === "deposit" &&
									"border-amber-500 text-amber-500",
							)}
						>
							{kit.payment_status || "unpaid"}
						</Badge>
					</div>
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Amount Paid</span>
						<span className="break-words text-right text-muted-foreground text-xs">
							{kit.amount_paid
								? `RM ${Number(kit.amount_paid).toFixed(2)}`
								: "-"}
						</span>
					</div>
					{kit.exhibitor_booth_price_label && (
						<div className="flex justify-between gap-2 py-0.5">
							<span className="shrink-0 font-medium text-xs">Booth Type</span>
							<span className="break-words text-right text-muted-foreground text-xs">
								{kit.exhibitor_booth_price_label}
							</span>
						</div>
					)}
					<div className="flex justify-between gap-2 py-0.5">
						<span className="shrink-0 font-medium text-xs">Package</span>
						<span className="break-words text-right text-muted-foreground text-xs">
							{kit.exhibitor_package_name ?? "—"}
						</span>
					</div>
					{kit.exhibitor_package_inclusions && (
						<ul className="list-disc space-y-0.5 py-0.5 pl-4 text-muted-foreground text-xs">
							{kit.exhibitor_package_inclusions
								.split("\n")
								.map((line) => line.trim())
								.filter(Boolean)
								.map((line) => (
									<li key={line}>{line}</li>
								))}
						</ul>
					)}
					<div className="flex items-center justify-between gap-2 border-t pt-1.5">
						<span className="font-medium text-xs">Payment Proof</span>
						<div className="flex items-center gap-2">
							{kit.payment_proof_status === "rejected" && (
								<Badge
									variant="outline"
									className="h-7 rounded-none border-destructive text-destructive text-xs"
								>
									Rejected
								</Badge>
							)}
							<PaymentProofPreviewButton
								url={kit.payment_proof_url}
								className="h-7 rounded-none px-2 text-xs"
							/>
						</div>
					</div>
					{kit.payment_note && (
						<div className="border-t pt-1.5">
							<span className="mb-0.5 block font-medium text-xs">Note</span>
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

				{showPaidSections && (
					<>
						<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
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
								<p className="text-muted-foreground text-xs">
									No items ordered
								</p>
							)}
						</div>

						<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
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
								<p className="text-muted-foreground text-xs">
									No services ordered
								</p>
							)}
						</div>
					</>
				)}

				{!expandTeamMembersSection && (
					<div className="min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
						{teamMembersContent}
					</div>
				)}
			</div>

			{expandTeamMembersSection && (
				<div className="mt-3 min-w-0 space-y-1.5 overflow-hidden border bg-background p-3">
					{teamMembersContent}
				</div>
			)}
		</div>
	);
}
