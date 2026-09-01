"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Building2,
	CreditCard,
	FileText,
	Package,
	Printer,
	Users,
} from "lucide-react";
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

const paymentStatusClasses: Record<string, string> = {
	paid: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
	unpaid: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
	waived: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
	sponsored:
		"border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
	deposit:
		"border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const boothTypeClasses: Record<string, string> = {
	shell_scheme:
		"border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400",
	raw_space:
		"border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

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
						"line-clamp-2 cursor-pointer text-muted-foreground text-sm transition-colors hover:text-foreground",
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

function Section({
	icon,
	title,
	action,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	action?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="overflow-hidden rounded-none border bg-card">
			<header className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
				<div className="flex items-center gap-2">
					<span className="text-primary">{icon}</span>
					<h4 className="font-semibold text-sm tracking-tight">{title}</h4>
				</div>
				{action}
			</header>
			<div className="px-4 py-3">{children}</div>
		</section>
	);
}

function Field({
	label,
	children,
	stacked = false,
}: {
	label: string;
	children: React.ReactNode;
	stacked?: boolean;
}) {
	if (stacked) {
		return (
			<div className="py-1">
				<p className="text-muted-foreground text-xs">{label}</p>
				<div className="mt-0.5 text-sm">{children}</div>
			</div>
		);
	}
	return (
		<div className="flex items-center justify-between gap-4 py-1">
			<p className="shrink-0 text-muted-foreground text-xs">{label}</p>
			<div className="min-w-0 text-right text-sm">{children}</div>
		</div>
	);
}

interface KitDetailsRowProps {
	vendor: EventVendor;
	kit: ExhibitorKit;
	batchSize?: number;
}

export function KitDetailsRow({ vendor, kit, batchSize }: KitDetailsRowProps) {
	const { user } = useAuth();
	const { data: event } = useQuery({
		queryKey: ["event", vendor.event_id],
		queryFn: () => getEventById(String(vendor.event_id)),
		enabled: !!kit,
	});

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

	const paymentClass = kit.payment_status
		? paymentStatusClasses[kit.payment_status]
		: undefined;

	const sideWalls =
		[
			kit.side_wall_left_required && "Left",
			kit.side_wall_right_required && "Right",
		]
			.filter(Boolean)
			.join(" & ") || "-";

	const documents: {
		key: string;
		label: string;
		available?: boolean;
		document?:
			| "ic-copy"
			| "customs-declaration"
			| "customs-duty-estimate"
			| "indemnity-form";
	}[] = [
		{ key: "ic", label: "IC Copy", available: kit.ic_copy_uploaded },
		{
			key: "customs",
			label: "Customs Declaration",
			available: kit.customs_declaration_uploaded,
			document: "customs-declaration",
		},
		{
			key: "duty",
			label: "Customs Duty Estimate",
			available: kit.customs_duty_estimate_uploaded,
			document: "customs-duty-estimate",
		},
		{
			key: "indemnity",
			label: "Indemnity Form",
			available: kit.indemnity_form_uploaded,
			document: "indemnity-form",
		},
	];

	const freeCount = kit.team_member_limit
		? Math.min(teamMembers.length, kit.team_member_limit)
		: teamMembers.length;
	const paidMembers = kit.team_member_limit
		? teamMembers.slice(kit.team_member_limit)
		: [];

	return (
		<div className="space-y-4">
			{/* Hero summary */}
			<div className="rounded-none border bg-gradient-to-br from-muted/60 to-muted/20 p-4">
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className={cn(
							"rounded-none px-2.5 py-0.5 font-mono text-xs",
							!kit.booth_number && "text-muted-foreground",
						)}
					>
						Booth {kit.booth_number || "—"}
					</Badge>
					{kit.booth_type && (
						<Badge
							variant="outline"
							className={cn(
								"rounded-none px-2.5 py-0.5 capitalize",
								boothTypeClasses[kit.booth_type] ?? "text-muted-foreground",
							)}
						>
							{kit.booth_type.replace(/_/g, " ")}
						</Badge>
					)}
					{kit.payment_status && (
						<Badge
							variant="outline"
							className={cn(
								"rounded-none px-2.5 py-0.5 font-semibold capitalize",
								paymentClass,
							)}
						>
							{kit.payment_status}
						</Badge>
					)}
					{kit.booking_batch_id && (
						<Badge variant="secondary" className="rounded-none px-2.5 py-0.5">
							{batchSize && batchSize > 1
								? `Batch of ${batchSize}`
								: "Bulk registration"}
						</Badge>
					)}
				</div>
				<p className="mt-3 font-semibold text-base leading-tight">
					{kit.company_name || vendor.vendor.full_name}
				</p>
				{kit.name_on_fascia && (
					<p className="mt-0.5 text-muted-foreground text-sm">
						Fascia: {kit.name_on_fascia}
					</p>
				)}
			</div>

			{/* Booth information */}
			<Section icon={<Building2 className="size-4" />} title="Booth Details">
				<div className="grid grid-cols-2 gap-x-4">
					<Field label="Dimensions">{kit.booth_dimensions || "-"}</Field>
					<Field label="Side Walls">{sideWalls}</Field>
					<Field label="Type">
						<span className="capitalize">
							{kit.booth_type?.replace(/_/g, " ") || "-"}
						</span>
					</Field>
					<Field label="Fascia Upgrade">
						{kit.fascia_upgrade_required ? "Yes" : "No"}
					</Field>
				</div>
				{customFieldsEntries.length > 0 && (
					<div className="mt-2 space-y-2 border-t pt-3">
						{customFieldsEntries.map((entry) => (
							<div key={entry.key}>
								<p className="text-muted-foreground text-xs">{entry.label}</p>
								<p className="whitespace-pre-wrap break-words text-sm">
									{entry.value}
								</p>
							</div>
						))}
					</div>
				)}
			</Section>

			{/* Company & PIC */}
			<Section
				icon={<Building2 className="size-4" />}
				title="Company & Contact"
			>
				<Field label="Company" stacked>
					{kit.company_name || "-"}
				</Field>
				{kit.company_address && (
					<Field label="Address" stacked>
						<span className="whitespace-pre-wrap break-words">
							{kit.company_address}
						</span>
					</Field>
				)}
				<Field label="Country" stacked>
					{kit.country || "-"}
				</Field>
				<div className="mt-2 border-t pt-3">
					<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Person In Charge
					</p>
					<p className="font-medium text-sm">{kit.pic_full_name || "-"}</p>
					<p className="text-muted-foreground text-sm">
						{kit.pic_contact_number || "-"}
					</p>
					<p className="break-words text-muted-foreground text-sm">
						{kit.pic_email_address || "-"}
					</p>
				</div>
			</Section>

			{/* Payment */}
			<Section
				icon={<CreditCard className="size-4" />}
				title="Booth Rental Payment"
				action={
					kit.payment_status ? (
						<Badge
							variant="outline"
							className={cn(
								"rounded-none px-2.5 py-0.5 font-semibold capitalize",
								paymentClass,
							)}
						>
							{kit.payment_status}
						</Badge>
					) : undefined
				}
			>
				<Field label="Amount Paid">
					<span className="font-semibold">
						{kit.amount_paid ? `RM ${Number(kit.amount_paid).toFixed(2)}` : "-"}
					</span>
				</Field>
				{kit.exhibitor_booth_price_label && (
					<Field label="Booth Type">{kit.exhibitor_booth_price_label}</Field>
				)}
				<Field label="Package">{kit.exhibitor_package_name ?? "—"}</Field>
				{kit.exhibitor_package_inclusions && (
					<ul className="mt-1 list-disc space-y-0.5 border-t pt-2 pl-4 text-muted-foreground text-sm">
						{kit.exhibitor_package_inclusions
							.split("\n")
							.map((line) => line.trim())
							.filter(Boolean)
							.map((line) => (
								<li key={line}>{line}</li>
							))}
					</ul>
				)}
				<div className="mt-2 flex items-center justify-between gap-2 border-t pt-3">
					<p className="text-muted-foreground text-xs">Payment Proof</p>
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
					<div className="mt-2 border-t pt-3">
						<p className="mb-0.5 text-muted-foreground text-xs">Note</p>
						<ExpandableText text={kit.payment_note} />
					</div>
				)}
				{kit.special_requirements && (
					<div className="mt-2 border-t pt-3">
						<p className="mb-0.5 text-muted-foreground text-xs">
							Special Requirements
						</p>
						<ExpandableText text={kit.special_requirements} />
					</div>
				)}
			</Section>

			{/* Documents */}
			<Section icon={<FileText className="size-4" />} title="Documents">
				<div className="space-y-1">
					{documents.map((doc) => (
						<div
							key={doc.key}
							className="flex items-center justify-between gap-3 py-1"
						>
							<div className="flex items-center gap-2">
								<span
									className={cn(
										"size-1.5 rounded-full",
										doc.available ? "bg-green-500" : "bg-muted-foreground/40",
									)}
								/>
								<p className="text-sm">{doc.label}</p>
							</div>
							<IcCopyPreviewButton
								eventId={vendor.event_id}
								kitId={kit.id}
								available={doc.available}
								document={doc.document}
								boothNumber={kit.booth_number}
							/>
						</div>
					))}
				</div>
			</Section>

			{/* Ordered items & printing */}
			{showPaidSections && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Section
						icon={<Package className="size-4" />}
						title={`Ordered Items (${mergedItems.length})`}
					>
						{mergedItems.length > 0 ? (
							<div className="scrollbar-thin scrollbar-track-transparent max-h-40 space-y-1.5 overflow-y-auto pr-1">
								{mergedItems.map((item) => (
									<div
										key={item.rentable_item_id}
										className="flex items-center justify-between gap-2 rounded-none border bg-muted/30 px-2.5 py-1.5"
									>
										<span className="truncate font-medium text-sm">
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
							<p className="text-muted-foreground text-sm">No items ordered</p>
						)}
					</Section>

					<Section
						icon={<Printer className="size-4" />}
						title={`Printing Services (${mergedPrintings.length})`}
					>
						{mergedPrintings.length > 0 ? (
							<div className="scrollbar-thin scrollbar-track-transparent max-h-40 space-y-1.5 overflow-y-auto pr-1">
								{mergedPrintings.map((printing) => (
									<div
										key={printing.printing_service_id}
										className="flex items-center justify-between gap-2 rounded-none border bg-muted/30 px-2.5 py-1.5"
									>
										<span className="truncate font-medium text-sm">
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
							<p className="text-muted-foreground text-sm">
								No services ordered
							</p>
						)}
					</Section>
				</div>
			)}

			{/* Team members */}
			<Section
				icon={<Users className="size-4" />}
				title={`Team Members (${teamMembers.length})`}
				action={
					kit.team_member_limit ? (
						<span className="text-muted-foreground text-xs">
							Limit {kit.team_member_limit}
						</span>
					) : undefined
				}
			>
				{teamMembers.length > 0 ? (
					<div className="space-y-4">
						<div>
							{kit.team_member_limit ? (
								<div className="mb-2 flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
										Free Team Members
									</p>
									<span className="font-medium text-green-600 text-xs dark:text-green-400">
										{freeCount} / {kit.team_member_limit}
									</span>
								</div>
							) : null}
							<div
								className={cn(
									expandTeamMembersSection
										? "grid grid-cols-1 gap-2 sm:grid-cols-2"
										: "space-y-1",
								)}
							>
								{teamMembers
									.slice(0, kit.team_member_limit ?? teamMembers.length)
									.map((member, idx) => (
										<div
											key={member.id || idx}
											className="flex items-center gap-2 rounded-none border border-green-200 bg-green-50 px-2.5 py-1.5 dark:border-green-800 dark:bg-green-950/20"
										>
											<span className="size-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
											<span className="truncate text-sm">
												{member.full_name}
											</span>
										</div>
									))}
							</div>
						</div>

						{kit.team_member_limit != null && paidMembers.length > 0 && (
							<div>
								<div className="mb-2 flex items-center justify-between">
									<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
										Additional Team Members (Paid)
									</p>
									<span className="font-medium text-amber-600 text-xs dark:text-amber-400">
										{kit.excess_team_member_count ?? paidMembers.length} x RM{" "}
										{Number(kit.extra_team_member_fee || 0).toFixed(2)} = RM{" "}
										{Number(kit.extra_team_member_charges || 0).toFixed(2)}
									</span>
								</div>
								<div
									className={cn(
										expandTeamMembersSection
											? "grid grid-cols-1 gap-2 sm:grid-cols-2"
											: "space-y-1",
									)}
								>
									{paidMembers.map((member, idx) => (
										<div
											key={member.id || idx}
											className="flex items-center justify-between gap-2 rounded-none border border-amber-200 bg-amber-50 px-2.5 py-1.5 dark:border-amber-800 dark:bg-amber-950/20"
										>
											<div className="flex min-w-0 flex-1 items-center gap-2">
												<span className="size-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-400" />
												<span className="truncate text-sm">
													{member.full_name}
												</span>
											</div>
											<span className="shrink-0 font-medium text-amber-600 text-xs dark:text-amber-400">
												+RM {Number(kit.extra_team_member_fee || 0).toFixed(2)}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<p className="text-muted-foreground text-sm">No team members</p>
				)}
			</Section>
		</div>
	);
}
