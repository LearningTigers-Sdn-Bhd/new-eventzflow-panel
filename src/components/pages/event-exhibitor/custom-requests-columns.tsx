"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CustomRequest } from "@/lib/api/exhibitor-kit/response";
import { ReviewRequestDialog } from "./review-request-dialog";
import { RevokeRequestDialog } from "./revoke-request-dialog";

export interface CustomRequestWithVendor extends CustomRequest {
	vendor_name: string;
	vendor_email: string;
	event_id: number;
}

const statusConfig = {
	pending: {
		label: "Pending",
		icon: Clock,
		variant: "secondary" as const,
		color: "text-yellow-600",
	},
	approved: {
		label: "Approved",
		icon: CheckCircle2,
		variant: "default" as const,
		color: "text-green-600",
	},
	rejected: {
		label: "Rejected",
		icon: XCircle,
		variant: "destructive" as const,
		color: "text-red-600",
	},
};

export const customRequestsColumns: ColumnDef<CustomRequestWithVendor>[] = [
	{
		accessorKey: "vendor",
		header: "Exhibitor",
		cell: ({ row }) => {
			return (
				<div>
					<p className="font-medium">{row.original.vendor_name}</p>
					<p className="text-muted-foreground text-xs">
						{row.original.vendor_email}
					</p>
				</div>
			);
		},
		filterFn: (row, _id, value) => {
			const vendorName = row.original.vendor_name.toLowerCase();
			const vendorEmail = row.original.vendor_email.toLowerCase();
			const searchValue = value.toLowerCase();
			return (
				vendorName.includes(searchValue) || vendorEmail.includes(searchValue)
			);
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => {
			const description = row.original.description;
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="max-w-[300px] cursor-default">
								<p className="truncate">{description}</p>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="max-w-[400px] rounded-none"
						>
							<p className="whitespace-pre-wrap">{description}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
	},
	{
		accessorKey: "quantity",
		header: "Qty",
		cell: ({ row }) => row.original.quantity,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status;
			const config = statusConfig[status];
			const StatusIcon = config.icon;
			return (
				<Badge variant={config.variant} className="gap-1 rounded-none">
					<StatusIcon className="h-3 w-3" />
					{config.label}
				</Badge>
			);
		},
		filterFn: (row, _id, value) => {
			return row.original.status === value;
		},
	},
	{
		accessorKey: "resolved_price",
		header: "Price",
		cell: ({ row }) => {
			const price = row.original.resolved_price;
			if (price === undefined || price === null) return "-";
			return new Intl.NumberFormat("en-MY", {
				style: "currency",
				currency: "MYR",
			}).format(price);
		},
	},
	{
		accessorKey: "response_notes",
		header: "Notes",
		cell: ({ row }) => {
			const notes = row.original.response_notes;
			if (!notes) return "-";
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="max-w-[200px] cursor-default">
								<p className="truncate text-muted-foreground text-sm">
									{notes}
								</p>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							className="max-w-[400px] rounded-none"
						>
							<p className="whitespace-pre-wrap">{notes}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => {
			const request = row.original;

			if (request.status === "pending") {
				return (
					<ReviewRequestDialog
						request={request}
						eventId={request.event_id}
						exhibitorKitId={request.exhibitor_kit_id}
					/>
				);
			}

			if (request.status === "approved" || request.status === "rejected") {
				return (
					<RevokeRequestDialog
						request={request}
						eventId={request.event_id}
						exhibitorKitId={request.exhibitor_kit_id}
					/>
				);
			}

			return null;
		},
	},
];
