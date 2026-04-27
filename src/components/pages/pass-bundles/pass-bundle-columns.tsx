"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PassBundle } from "@/lib/api/pass-bundle";
import { PassBundleActionsMenu } from "./pass-bundle-action-menu";
import {
	passBundleStatusLabel,
	paymentModeLabel,
	paymentStatusLabel,
} from "./pass-bundle-labels";

interface ColumnActions {
	onEdit: (bundle: PassBundle) => void;
	onQr: (bundle: PassBundle) => void;
	onDelete: (bundle: PassBundle) => void;
}

export function generatePassBundleColumns({
	onEdit,
	onQr,
	onDelete,
}: ColumnActions): ColumnDef<PassBundle>[] {
	return [
		{
			accessorKey: "name",
			header: "Bundle Owner",
		},
		{
			id: "registrationFormName",
			accessorFn: (row) => row.registrationForm.name,
			header: "Registration Form",
			cell: ({ row }) => row.original.registrationForm.name,
		},
		{
			id: "ticketTypeName",
			accessorFn: (row) => row.ticketType.name,
			header: "Ticket Type",
			cell: ({ row }) => row.original.ticketType.name,
		},
		{
			accessorKey: "usedCount",
			header: "Usage",
			cell: ({ row }) =>
				`${row.original.usedCount} of ${row.original.passLimit} used`,
		},
		{
			accessorKey: "paymentMode",
			header: "Payment",
			cell: ({ row }) => (
				<div className="flex flex-col items-start gap-1">
					<Badge
						variant="outline"
						className="min-w-[96px] justify-center rounded-none px-2 py-0.5 text-xs"
					>
						{paymentModeLabel[row.original.paymentMode]}
					</Badge>
					<Badge className="min-w-[96px] justify-center rounded-none px-2 py-0.5 text-xs">
						{paymentStatusLabel[row.original.paymentStatus]}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant={row.original.status === "active" ? "default" : "secondary"}
					className="rounded-none"
				>
					{passBundleStatusLabel[row.original.status]}
				</Badge>
			),
		},
		{
			id: "copy",
			header: "Bundle Link",
			enableSorting: false,
			cell: ({ row }) => (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="rounded-none"
					onClick={async () => {
						await navigator.clipboard.writeText(row.original.bundleLink);
						toast.success("Bundle link copied");
					}}
				>
					<Copy className="mr-2 size-4" />
					Copy
				</Button>
			),
		},
		{
			id: "actions",
			header: "Actions",
			enableSorting: false,
			cell: ({ row }) => (
				<PassBundleActionsMenu
					bundle={row.original}
					onEdit={onEdit}
					onQr={onQr}
					onDelete={onDelete}
				/>
			),
		},
	];
}
