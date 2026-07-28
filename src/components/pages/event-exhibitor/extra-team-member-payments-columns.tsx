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
import type { ExhibitorTeamMemberPaymentInKit } from "@/lib/api/exhibitor-kit/response";
import { cn } from "@/lib/utils";

export interface TeamMemberPaymentWithVendor
	extends ExhibitorTeamMemberPaymentInKit {
	vendor_name: string;
	vendor_email: string;
	event_vendor_id: number;
	booth_number: string;
	booth_name: string;
}

const getStatusConfig = (status: TeamMemberPaymentWithVendor["status"]) => {
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

export interface PaymentsTableMeta {
	onVerify: (payment: TeamMemberPaymentWithVendor) => void;
	onReject: (payment: TeamMemberPaymentWithVendor) => void;
}

export const paymentsColumns: ColumnDef<TeamMemberPaymentWithVendor>[] = [
	{
		accessorKey: "vendor_name",
		header: "Exhibitor",
		cell: ({ row }) => (
			<div>
				<p className="font-medium">{row.original.vendor_name}</p>
				<p className="text-muted-foreground text-xs">
					{row.original.vendor_email}
				</p>
			</div>
		),
	},
	{
		accessorKey: "booth_number",
		header: "Booth",
		cell: ({ row }) => (
			<div>
				<p className="font-medium">{row.original.booth_number || "-"}</p>
				<p className="text-muted-foreground text-xs">
					{row.original.booth_name || "-"}
				</p>
			</div>
		),
	},
	{
		accessorKey: "extra_member_count",
		header: "Extra Members",
		cell: ({ row }) => (
			<div className="text-center">
				<span className="font-medium">{row.original.extra_member_count}</span>
				<p className="text-muted-foreground text-xs">
					× RM {Number(row.original.fee_per_member).toFixed(2)}
				</p>
			</div>
		),
	},
	{
		accessorKey: "amount",
		header: "Amount",
		cell: ({ row }) => (
			<span className="font-bold">
				RM {Number(row.original.amount).toFixed(2)}
			</span>
		),
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
		accessorKey: "external_ref",
		header: "Reference",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-sm">
				{row.original.external_ref || "-"}
			</span>
		),
	},
	{
		id: "proof",
		header: "Proof",
		cell: ({ row }) => {
			if (!row.original.payment_proof_url) {
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
						href={row.original.payment_proof_url}
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
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as PaymentsTableMeta | undefined;
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

			return <span className="text-muted-foreground text-sm">-</span>;
		},
	},
];
