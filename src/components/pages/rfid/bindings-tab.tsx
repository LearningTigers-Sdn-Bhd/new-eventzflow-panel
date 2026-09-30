"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { deleteRfidBinding, type RfidBinding } from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { BindingEditDialog } from "./binding-edit-dialog";
import { ConfirmDialog } from "./confirm-dialog";
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

function buildColumns(
	actions: (binding: RfidBinding) => ReactNode,
): ColumnDef<RfidBinding, unknown>[] {
	return [
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
			cell: ({ row }) => (
				<code className="text-sm">{row.original.tag_key}</code>
			),
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
		{
			id: "actions",
			header: "",
			cell: ({ row }) => actions(row.original),
		},
	];
}

export function BindingsTab({
	eventId,
	bindings,
	canAdmin,
}: {
	eventId: string;
	bindings: RfidBinding[];
	canAdmin: boolean;
}) {
	const queryClient = useQueryClient();
	const [editing, setEditing] = useState<RfidBinding | null>(null);
	const [toDelete, setToDelete] = useState<RfidBinding | null>(null);

	const deleteMutation = useMutation({
		mutationFn: (binding: RfidBinding) =>
			deleteRfidBinding(eventId, binding.id),
		onSuccess: () => {
			toast.success("Binding deleted.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			setToDelete(null);
		},
		onError: (error) => toast.error(error.message),
	});

	const actions = (binding: RfidBinding) =>
		canAdmin ? (
			<div className="flex gap-2">
				{binding.active && (
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={() => setEditing(binding)}
					>
						<Pencil className="size-4" />
						Edit
					</Button>
				)}
				<Button
					variant="outline"
					size="sm"
					className="rounded-none text-destructive"
					onClick={() => setToDelete(binding)}
				>
					<Trash2 className="size-4" />
					Delete
				</Button>
			</div>
		) : null;

	return (
		<>
			<RfidTable
				columns={buildColumns(actions)}
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
							{actions(binding)}
						</ItemContent>
					</Item>
				)}
			/>
			<BindingEditDialog
				eventId={eventId}
				binding={editing}
				onOpenChange={(open) => !open && setEditing(null)}
			/>
			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(open) => !open && setToDelete(null)}
				title="Delete this binding?"
				description="The sticker stops belonging to this ticket. Earlier readings of it are re-measured and become unknown. It cannot be undone."
				confirmLabel="Delete binding"
				pending={deleteMutation.isPending}
				onConfirm={() => toDelete && deleteMutation.mutate(toDelete)}
			/>
		</>
	);
}
