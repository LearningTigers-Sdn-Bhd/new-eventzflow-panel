"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	Clock,
	ExternalLink,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReceivedPayment } from "@/lib/api/received-payment";
import { cn } from "@/lib/utils";

const getStatusConfig = (status: ReceivedPayment["status"]) => {
	switch (status) {
		case "pending":
			return {
				icon: Clock,
				label: "Pending",
				badgeStyle: "border-gray-500 text-gray-600",
			};
		case "submitted":
			return {
				icon: AlertCircle,
				label: "Under Review",
				badgeStyle: "border-blue-500 text-blue-600",
			};
		case "verified":
			return {
				icon: CheckCircle2,
				label: "Verified",
				badgeStyle: "border-green-500 text-green-600",
			};
		case "rejected":
			return {
				icon: XCircle,
				label: "Rejected",
				badgeStyle: "border-red-500 text-red-600",
			};
	}
};

export interface ReceivedPaymentsTableMeta {
	onVerify: (payment: ReceivedPayment) => void;
	onReject: (payment: ReceivedPayment) => void;
}

export const receivedPaymentsColumns: ColumnDef<ReceivedPayment>[] = [
	{
		accessorKey: "exhibitorInfo",
		header: "Exhibitor",
		cell: ({ row }) => (
			<div>
				<p className="font-medium">
					{row.original.exhibitorInfo.companyName ||
						row.original.exhibitorInfo.vendorName ||
						"-"}
				</p>
				<p className="text-muted-foreground text-xs">
					{row.original.exhibitorInfo.vendorEmail}
				</p>
				{row.original.exhibitorInfo.boothNumber && (
					<p className="text-muted-foreground text-xs">
						Booth: {row.original.exhibitorInfo.boothNumber}
					</p>
				)}
			</div>
		),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => (
			<span className="font-bold">RM {row.original.amount.toFixed(2)}</span>
		),
	},
	{
		id: "items",
		header: "Items",
		cell: ({ row }) => {
			const items = row.original.items || [];
			const printings = row.original.printings || [];
			const totalItems = items.length + printings.length;

			if (totalItems === 0) {
				return <span className="text-muted-foreground text-sm">-</span>;
			}

			return (
				<div className="text-sm">
					{items.length > 0 && <p>{items.length} rentable item(s)</p>}
					{printings.length > 0 && (
						<p>{printings.length} printing service(s)</p>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => {
			const filterStatus = column.getFilterValue() as string | undefined;
			const getFilterLabel = (status: string | undefined) => {
				switch (status) {
					case "submitted":
						return "Under Review";
					case "verified":
						return "Verified";
					case "rejected":
						return "Rejected";
					case "pending":
						return "Pending";
					default:
						return null;
				}
			};
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<div className="flex cursor-pointer items-center gap-2">
							<p className="font-medium">
								Status
								{filterStatus && (
									<Badge
										variant="secondary"
										className="ml-2 bg-transparent text-xs underline"
									>
										{getFilterLabel(filterStatus)}
									</Badge>
								)}
							</p>
							<ChevronDown className="size-4" />
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="bottom"
						className="rounded-none bg-background"
					>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue(undefined)}
						>
							All Status
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("submitted")}
						>
							Under Review
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("verified")}
						>
							Verified
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("rejected")}
						>
							Rejected
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-none"
							onClick={() => column.setFilterValue("pending")}
						>
							Pending
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		cell: ({ row }) => {
			const config = getStatusConfig(row.original.status);
			const StatusIcon = config.icon;
			return (
				<Badge
					variant="outline"
					className={cn("gap-1 rounded-none", config.badgeStyle)}
				>
					<StatusIcon className="size-3" />
					{config.label}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return row.getValue(id) === value;
		},
	},
	{
		accessorKey: "externalRef",
		header: "Reference",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-sm">
				{row.original.externalRef || "-"}
			</span>
		),
	},
	{
		id: "proof",
		header: "Proof",
		cell: ({ row }) => {
			if (!row.original.paymentProofUrl) {
				return <span className="text-muted-foreground text-sm">-</span>;
			}
			return (
				<Button
					variant="outline"
					size="sm"
					className="gap-1 rounded-none"
					asChild
				>
					<a
						href={row.original.paymentProofUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<ExternalLink className="size-3" />
						View
					</a>
				</Button>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-sm">
				{new Date(row.original.createdAt).toLocaleDateString()}
			</span>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as ReceivedPaymentsTableMeta | undefined;
			const payment = row.original;

			if (payment.status === "verified") {
				return (
					<Badge className="rounded-none bg-green-600">
						<CheckCircle2 className="mr-1 size-3" />
						Paid
					</Badge>
				);
			}

			if (payment.status === "submitted") {
				return (
					<div className="flex gap-2">
						<Button
							size="sm"
							className="rounded-none bg-green-600 hover:bg-green-700"
							onClick={() => meta?.onVerify(payment)}
						>
							<CheckCircle2 className="mr-1 size-3" />
							Verify
						</Button>
						<Button
							size="sm"
							variant="destructive"
							className="rounded-none"
							onClick={() => meta?.onReject(payment)}
						>
							<XCircle className="mr-1 size-3" />
							Reject
						</Button>
					</div>
				);
			}

			if (payment.status === "rejected") {
				return (
					<span className="text-muted-foreground text-sm">
						Awaiting resubmission
					</span>
				);
			}

			// pending status - exhibitor hasn't submitted payment yet
			return (
				<span className="text-muted-foreground text-sm">Awaiting payment</span>
			);
		},
	},
];
