"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { RfidBinding } from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { RfidTable } from "./rfid-table";

function StatusBadge({ active }: { active: boolean }) {
	return (
		<Badge
			className={cn(
				"rounded-none",
				active
					? "bg-green-100 text-green-800 hover:bg-green-100"
					: "bg-gray-100 text-gray-800 hover:bg-gray-100",
			)}
		>
			{active ? "active" : "revoked"}
		</Badge>
	);
}

const columns: ColumnDef<RfidBinding, unknown>[] = [
	{
		accessorKey: "ticket_name",
		header: "Ticket",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span className="font-medium">{row.original.ticket_name ?? "—"}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.ticket_public_id ?? ""}
				</span>
			</div>
		),
	},
	{
		accessorKey: "tag_key",
		header: "Tag key",
		cell: ({ row }) => <code className="text-sm">{row.original.tag_key}</code>,
	},
	{ accessorKey: "protocol", header: "Protocol" },
	{ accessorKey: "mode", header: "Mode" },
	{
		accessorKey: "active",
		header: "Status",
		cell: ({ row }) => <StatusBadge active={row.original.active} />,
	},
	{
		accessorKey: "captured_at",
		header: "Captured",
		cell: ({ row }) => formatDateTime(row.original.captured_at),
	},
	{
		accessorKey: "revoked_at",
		header: "Revoked",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span>
					{row.original.revoked_at ? (
						formatDateTime(row.original.revoked_at)
					) : (
						<span className="text-muted-foreground">—</span>
					)}
				</span>
				{row.original.revocation_reason && (
					<span className="text-muted-foreground text-sm">
						{row.original.revocation_reason}
					</span>
				)}
			</div>
		),
	},
];

export function BindingsTab({ bindings }: { bindings: RfidBinding[] }) {
	return (
		<RfidTable
			columns={columns}
			data={bindings}
			emptyTitle="No bindings yet"
			emptyDescription="Sticker and wristband bindings appear here after the desk links them."
			renderMobileCard={(binding) => (
				<Item variant="outline" className="w-full rounded-none">
					<ItemHeader className="flex flex-col items-start gap-1">
						<ItemTitle className="w-full justify-between">
							<span className="font-bold text-base">
								{binding.ticket_name ?? "—"}
							</span>
							<StatusBadge active={binding.active} />
						</ItemTitle>
						<ItemDescription className="font-mono text-xs">
							{binding.ticket_public_id ?? ""}
						</ItemDescription>
					</ItemHeader>
					<ItemContent className="space-y-1 text-muted-foreground text-sm">
						<p>
							Tag <code>{binding.tag_key}</code> · {binding.protocol} ·{" "}
							{binding.mode}
						</p>
						<p>Captured: {formatDateTime(binding.captured_at)}</p>
						{binding.revoked_at && (
							<p>
								Revoked: {formatDateTime(binding.revoked_at)}
								{binding.revocation_reason
									? ` — ${binding.revocation_reason}`
									: ""}
							</p>
						)}
					</ItemContent>
				</Item>
			)}
		/>
	);
}
