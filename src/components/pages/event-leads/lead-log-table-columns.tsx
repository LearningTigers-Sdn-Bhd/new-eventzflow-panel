"use client";

import { Label } from "@radix-ui/react-label";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { EventLeadWithDetails } from "@/lib/api/event-lead";

const LeadViewModal = ({
	name,
	email,
	phone,
	publicId,
	vendorName,
	leadableType,
	notes,
}: {
	name: string | null;
	email: string | null;
	phone: string | null;
	publicId: string | null;
	vendorName: string;
	leadableType: string;
	notes: string | null;
}) => {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard", {
			description: "The text has been copied to your clipboard.",
		});
	};
	return (
		<div className="space-y-2 border border-dashed">
			{/* Header */}
			<div className="flex items-center justify-between gap-4 border border-border bg-muted p-4">
				<div className="flex items-center gap-2">
					<div className="flex shrink-0 items-center justify-center bg-blue-500 p-3">
						<User className="size-6 text-white" />
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="truncate font-semibold text-gray-900 text-lg">
							{name}
						</h3>
						<p className="mt-0.5 text-muted-foreground text-xs">
							{leadableType === "Ticket" ? "Ticket Holder" : "Visitor"} Details
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => copyToClipboard(name ?? "")}
					className="rounded-none"
				>
					<Copy className="size-4 text-muted-foreground" />
				</Button>
			</div>

			{/* Contact Information */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{/* Phone */}
				<div className="flex items-start justify-between gap-3 border border-border bg-muted p-3.5 transition-colors hover:bg-muted/50">
					<div className="flex items-center gap-3">
						<div className="flex shrink-0 items-center justify-center bg-green-500/30 p-3">
							<Phone className="size-4.5 text-green-600" />
						</div>
						<div className="flex min-w-0 flex-col gap-1">
							<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								Phone
							</Label>
							<p className="mt-1 truncate font-medium text-foreground text-sm">
								{phone || "Not provided"}
							</p>
						</div>
					</div>
					{phone && (
						<Button
							variant="outline"
							size="icon"
							onClick={() => copyToClipboard(phone)}
							className="rounded-none"
						>
							<Copy className="size-4 text-muted-foreground" />
						</Button>
					)}
				</div>

				{/* Email */}
				<div className="flex items-start justify-between gap-3 border border-border bg-muted p-3.5 transition-colors hover:bg-muted/50">
					<div className="flex items-center gap-3">
						<div className="flex shrink-0 items-center justify-center bg-blue-500/30 p-3">
							<Mail className="size-4.5 text-blue-600" />
						</div>
						<div className="flex min-w-0 flex-col gap-1">
							<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								Email
							</Label>
							<p className="mt-1 break-all font-medium text-foreground text-sm">
								{email || "Not provided"}
							</p>
						</div>
					</div>
					{email && (
						<Button
							variant="outline"
							size="icon"
							onClick={() => copyToClipboard(email)}
							className="rounded-none"
						>
							<Copy className="size-4 text-muted-foreground" />
						</Button>
					)}
				</div>
			</div>

			{/* Public ID */}
			<div className="flex items-start justify-between gap-3 border border-border bg-muted p-3.5 transition-colors hover:bg-muted/50">
				<div className="flex items-center gap-3">
					<div className="flex shrink-0 items-center justify-center bg-purple-500/30 p-3">
						<User className="size-4.5 text-purple-600" />
					</div>
					<div className="flex min-w-0 flex-col gap-1">
						<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Public ID
						</Label>
						<code className="mt-1 rounded bg-muted px-2 py-1 font-mono text-sm">
							{publicId}
						</code>
					</div>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => copyToClipboard(publicId ?? "")}
					className="rounded-none"
				>
					<Copy className="size-4 text-muted-foreground" />
				</Button>
			</div>

			{/* Vendor Name */}
			<div className="flex items-start justify-between gap-3 border border-border bg-muted p-3.5 transition-colors hover:bg-muted/50">
				<div className="flex items-center gap-3">
					<div className="flex shrink-0 items-center justify-center bg-orange-500/30 p-3">
						<User className="size-4.5 text-orange-600" />
					</div>
					<div className="flex min-w-0 flex-col gap-1">
						<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Captured By
						</Label>
						<p className="mt-1 font-medium text-foreground text-sm">
							{vendorName}
						</p>
					</div>
				</div>
			</div>

			{/* Notes */}
			{notes && (
				<div className="flex items-start gap-3 border border-border bg-muted p-3.5">
					<div className="flex min-w-0 flex-col gap-1">
						<Label className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Notes
						</Label>
						<p className="mt-1 font-medium text-foreground text-sm whitespace-pre-wrap">
							{notes}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

// Searchable content for global search
export const getSearchableContent = (row: EventLeadWithDetails) =>
	`${row.lead_name} ${row.lead_email} ${row.lead_phone} ${row.lead_public_id} ${row.vendor_name}`;

export function generateColumns(): ColumnDef<EventLeadWithDetails>[] {
	return [
		{
			accessorKey: "lead_name",
			size: 250,
			header: ({ column }) => (
				<SortableHeader column={column} label="Attendee" />
			),
			cell: ({ row }) => {
				const lead = row.original;
				return (
					<div className="flex flex-col">
						<h3 className="font-medium">{lead.lead_name}</h3>
					</div>
				);
			},
		},
		{
			accessorKey: "leadable_type",
			size: 100,
			header: "Type",
			cell: ({ row }) => {
				const type = row.getValue("leadable_type") as string;
				return (
					<span className={`inline-flex items-center rounded-none px-2 py-0.5 text-xs font-medium ${
						type === "Visitor"
							? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
							: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
					}`}>
						{type}
					</span>
				);
			},
		},
		{
			id: "view",
			size: 60,
			enableHiding: false,
			header: "",
			cell: ({ row }) => {
				const { openDialog } = useDialog();
				const lead = row.original;
				const openViewModal = () => {
					openDialog({
						component: LeadViewModal,
						config: {
							title: "Lead Details",
							description: "View the details of the captured lead",
							size: "2xl",
							showCloseButton: true,
						},
						props: {
							name: lead.lead_name,
							email: lead.lead_email,
							phone: lead.lead_phone,
							publicId: lead.lead_public_id,
							vendorName: lead.vendor_name,
							leadableType: lead.leadable_type,
							notes: lead.notes,
						},
					});
				};
				return (
					<div className="flex justify-center">
						<Button
							variant="ghost"
							size="icon"
							onClick={openViewModal}
							title="View Details"
							className="rounded-none hover:border hover:border-border"
						>
							<Eye className="size-4 text-muted-foreground" />
						</Button>
					</div>
				);
			},
		},
		{
			id: "contact",
			size: 220,
			header: () => {
				return (
					<div className="flex items-center gap-2">
						<p className="font-medium">Contact</p>
					</div>
				);
			},
			cell: ({ row }) => {
				const lead = row.original;
				const phone = lead.lead_phone;
				const email = lead.lead_email;

				return (
					<div className="flex min-w-0 flex-col gap-1">
						{phone && (
							<div className="flex items-center gap-1.5 text-sm">
								<Phone className="size-3 shrink-0 text-muted-foreground" />
								<span className="truncate">{phone}</span>
							</div>
						)}
						{email && (
							<div className="flex items-center gap-1.5 text-sm">
								<Mail className="size-3 shrink-0 text-muted-foreground" />
								<span className="max-w-[180px] truncate" title={email}>
									{email}
								</span>
							</div>
						)}
						{!phone && !email && (
							<span className="text-muted-foreground text-sm">
								No contact info
							</span>
						)}
					</div>
				);
			},
		},
		{
			accessorKey: "vendor_name",
			size: 200,
			header: ({ column }) => (
				<SortableHeader column={column} label="Captured By" />
			),
			cell: ({ row }) => {
				return <div className="font-medium">{row.getValue("vendor_name")}</div>;
			},
		},
		{
			accessorKey: "created_at",
			size: 200,
			header: ({ column }) => (
				<SortableHeader column={column} label="Captured At" />
			),
			cell: ({ row }) => {
				const createdAt = row.getValue("created_at") as string;
				return (
					<div className="font-medium">
						{new Date(createdAt).toLocaleString()}
					</div>
				);
			},
		},
	];
}
