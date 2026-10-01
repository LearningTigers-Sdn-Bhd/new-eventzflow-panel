"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import {
	deleteRfidBinding,
	type RfidBinding,
	type RfidPagination,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { BindingEditDialog } from "./binding-edit-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { RfidTable } from "./rfid-table";
import { useServerSearch } from "./use-server-search";

type StatusFilter = "active" | "revoked" | undefined;

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

export function BindingsTab({
	eventId,
	bindings,
	ticketTypes,
	pagination,
	page,
	onPageChange,
	onPerPageChange,
	status,
	onStatusChange,
	search,
	onSearchChange,
	ticketType,
	onTicketTypeChange,
	canAdmin,
}: {
	eventId: string;
	bindings: RfidBinding[];
	ticketTypes: { id: number; name: string }[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (size: number) => void;
	status: StatusFilter;
	onStatusChange: (status: StatusFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	ticketType: string;
	onTicketTypeChange: (value: string) => void;
	canAdmin: boolean;
}) {
	const queryClient = useQueryClient();
	const [editing, setEditing] = useState<RfidBinding | null>(null);
	const [toDelete, setToDelete] = useState<RfidBinding | null>(null);
	const [searchDraft, setSearchDraft] = useServerSearch(
		search,
		onSearchChange,
		() => onPageChange(1),
	);

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

	// Same grouped icon buttons as the Manage Tickets table.
	const actions = (binding: RfidBinding) =>
		canAdmin ? (
			<ButtonGroup>
				{binding.active && (
					<Button
						size="icon-sm"
						variant="outline"
						className="h-8 w-8 rounded-none p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
						title="Edit Binding"
						onClick={() => setEditing(binding)}
					>
						<Pencil className="size-4" />
					</Button>
				)}
				<Button
					size="icon-sm"
					variant="outline"
					className="h-8 w-8 rounded-none p-0 text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
					title="Delete Binding"
					onClick={() => setToDelete(binding)}
				>
					<Trash2 className="size-4" />
				</Button>
			</ButtonGroup>
		) : null;

	const columns: ColumnDef<RfidBinding, unknown>[] = [
		{
			accessorKey: "ticket_name",
			header: "Guest",
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
			accessorKey: "ticket_type",
			header: "Ticket type",
			cell: ({ row }) => row.original.ticket_type ?? "—",
		},
		{
			accessorKey: "tag_key",
			header: "Sticker",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<code className="text-sm">{row.original.tag_key}</code>
					<span className="text-muted-foreground text-xs">
						{row.original.protocol} · {row.original.mode}
					</span>
				</div>
			),
		},
		{
			accessorKey: "active",
			header: "Status",
			cell: ({ row }) => <StatusBadge active={row.original.active} />,
		},
		{
			accessorKey: "captured_at",
			header: "Linked at",
			cell: ({ row }) => formatDateTime(row.original.captured_at),
		},
		{
			accessorKey: "revoked_at",
			header: "Revoked",
			cell: ({ row }) =>
				row.original.revoked_at ? (
					<div className="flex flex-col gap-1">
						<span>{formatDateTime(row.original.revoked_at)}</span>
						{row.original.revocation_reason && (
							<span className="text-muted-foreground text-sm">
								{row.original.revocation_reason}
							</span>
						)}
					</div>
				) : (
					<span className="text-muted-foreground">—</span>
				),
		},
		...(canAdmin
			? [
					{
						id: "actions",
						header: () => <div className="text-center">Actions</div>,
						cell: ({ row }) => (
							<div className="flex justify-center">{actions(row.original)}</div>
						),
					} satisfies ColumnDef<RfidBinding, unknown>,
				]
			: []),
	];

	return (
		<>
			<RfidTable
				control={{
					search: {
						placeholder: "Search guest, ticket ID or sticker...",
						enableCustomSearch: false,
						controlled: { value: searchDraft, onChange: setSearchDraft },
					},
					filters: [
						{
							label: "Status",
							columnId: "status",
							type: "filter",
							data: [
								{ label: "All", value: "all" },
								{ label: "Active", value: "active" },
								{ label: "Revoked", value: "revoked" },
							],
							customFilter: {
								value: status ?? "all",
								onChange: (value) => {
									onStatusChange(
										value === "all" ? undefined : (value as StatusFilter),
									);
									onPageChange(1);
								},
							},
						},
						{
							label: "Ticket Type",
							columnId: "ticketType",
							type: "filter",
							data: [
								{ label: "All", value: "all" },
								...ticketTypes.map((type) => ({
									label: type.name,
									value: String(type.id),
								})),
							],
							customFilter: {
								value: ticketType || "all",
								onChange: (value) => {
									onTicketTypeChange(value === "all" ? "" : value);
									onPageChange(1);
								},
							},
						},
					],
				}}
				columns={columns}
				data={bindings}
				emptyTitle={
					search || status || ticketType
						? "No bindings match"
						: "No bindings yet"
				}
				emptyDescription={
					search || status || ticketType
						? "Try a different search or clear the filters."
						: "Sticker and wristband bindings appear here after the desk links them."
				}
				pagination={
					pagination
						? {
								pageIndex: page - 1,
								pageSize: pagination.per_page,
								pageCount: pagination.total_pages,
								totalCount: pagination.total_count,
								onPageChange: (pageIndex) => onPageChange(pageIndex + 1),
								onPageSizeChange: (size) => {
									onPerPageChange(size);
									onPageChange(1);
								},
							}
						: undefined
				}
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
								{binding.ticket_type ? ` · ${binding.ticket_type}` : ""}
							</ItemDescription>
						</ItemHeader>
						<ItemContent className="space-y-1 text-muted-foreground text-sm">
							<p>
								Sticker <code>{binding.tag_key}</code> · {binding.protocol} ·{" "}
								{binding.mode}
							</p>
							<p>Linked: {formatDateTime(binding.captured_at)}</p>
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
