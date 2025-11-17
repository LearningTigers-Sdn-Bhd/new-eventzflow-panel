"use client";

import { Label } from "@radix-ui/react-label";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Copy, Eye, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";
import type { VisitorStampWithDetails } from "@/lib/api/visitor-stamp";

const VisitorStampViewModal = ({
	name,
	email,
	phone,
	publicId,
	vendorName,
}: {
	name: string;
	email: string;
	phone: string;
	publicId: string;
	vendorName: string;
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
							Visitor Details
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => copyToClipboard(name)}
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
					onClick={() => copyToClipboard(publicId)}
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
							Stamped By
						</Label>
						<p className="mt-1 font-medium text-foreground text-sm">
							{vendorName}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

// Searchable content for global search
export const getSearchableContent = (row: VisitorStampWithDetails) =>
	`${row.visitor_name} ${row.visitor_email} ${row.visitor_phone} ${row.visitor_public_id} ${row.vendor_name}`;

export const columns: ColumnDef<VisitorStampWithDetails>[] = [
	{
		accessorKey: "visitor_name",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Visitor</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const stamp = row.original;
			return (
				<div className="flex flex-col gap-1">
					<h3 className="font-medium">{stamp.visitor_name}</h3>
					<p className="text-muted-foreground text-sm">
						{stamp.visitor_email || "No email"}
					</p>
				</div>
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
			const stamp = row.original;
			const openViewModal = () => {
				openDialog({
					component: VisitorStampViewModal,
					config: {
						title: "Visitor Stamp Details",
						description: "View the details of the stamp",
						size: "2xl",
						showCloseButton: true,
					},
					props: {
						name: stamp.visitor_name,
						email: stamp.visitor_email,
						phone: stamp.visitor_phone,
						publicId: stamp.visitor_public_id,
						vendorName: stamp.vendor_name,
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
		accessorKey: "visitor_public_id",
		size: 180,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Public ID</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			return (
				<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
					{row.getValue("visitor_public_id")}
				</code>
			);
		},
	},
	{
		accessorKey: "vendor_name",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Stamped By</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			return (
				<div className="font-medium">{row.getValue("vendor_name")}</div>
			);
		},
	},
	{
		accessorKey: "created_at",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Registered At</p>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="rounded-none"
					>
						<ArrowDown
							className={cn(
								"size-4 transition-transform",
								column.getIsSorted() === "asc" && "-rotate-180",
							)}
						/>
					</Button>
				</div>
			);
		},
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
