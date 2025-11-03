"use client";

import { Label } from "@radix-ui/react-label";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, Copy, Eye, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";

export type ScannedLog = {
	id: string;
	name: string;
	email: string;
	phone: string;
	locationName: string;
	scannedBy: string;
	status: "scanned" | "not_scanned";
	checkedInAt: string;
};

const ScannedLogViewModal = ({
	name,
	email,
	phone,
}: {
	name: string;
	email: string;
	phone: string;
}) => {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard", {
			description: "The text has been copied to your clipboard.",
		});
	};
	return (
		<div className="space-y-2 border border-dashed">
			{/* Header - Cleaner, more subtle */}
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
							Attendee Details
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

			{/* Contact Information - Side by side */}
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
								{phone}
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => copyToClipboard(phone)}
						className="rounded-none"
					>
						<Copy className="size-4 text-muted-foreground" />
					</Button>
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
								{email}
							</p>
						</div>
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={() => copyToClipboard(email)}
						className="rounded-none"
					>
						<Copy className="size-4 text-muted-foreground" />
					</Button>
				</div>
			</div>
		</div>
	);
};

// Searchable content for global search
export const getSearchableContent = (row: ScannedLog) =>
	`${row.name} ${row.email} ${row.phone} ${row.locationName} ${row.scannedBy}`;

export const columns: ColumnDef<ScannedLog>[] = [
	{
		accessorKey: "name",
		size: 250,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Ticket</p>
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
			const scannedLog = row.original;
			return (
				<div className="flex flex-col gap-1">
					<h3 className="font-medium">{scannedLog.name}</h3>
					<p className="text-muted-foreground text-sm">{scannedLog.email}</p>
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
			const scannedLog = row.original;
			const openViewModal = () => {
				openDialog({
					component: ScannedLogViewModal,
					config: {
						title: "Scan Log Details",
						description: "View the details of the scan log",
						size: "2xl",
						showCloseButton: true,
					},
					props: {
						name: scannedLog.name,
						email: scannedLog.email,
						phone: scannedLog.phone,
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
		id: "locationName",
		accessorFn: (row) => row.locationName,
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Location</p>
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
			return <div className="font-medium">{row.getValue("locationName")}</div>;
		},
	},
	{
		accessorKey: "scannedBy",
		size: 220,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Scanned By</p>
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
			return <div className="font-medium">{row.getValue("scannedBy")}</div>;
		},
	},
	{
		accessorKey: "status",
		size: 120,
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			return (
				<Badge
					variant={status === "scanned" ? "default" : "secondary"}
					className={cn(
						"rounded-none",
						status === "scanned"
							? "bg-green-100 text-green-800 hover:bg-green-100"
							: "bg-gray-100 text-gray-800 hover:bg-gray-100",
					)}
				>
					{status === "scanned" ? "Scanned" : "Not Scanned"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "checkedInAt",
		size: 200,
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-2">
					<p className="font-medium">Check-In Time</p>
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
			const checkedInAt = row.getValue("checkedInAt") as string;
			return (
				<div className="font-medium">
					{new Date(checkedInAt).toLocaleString()}
				</div>
			);
		},
	},
];
