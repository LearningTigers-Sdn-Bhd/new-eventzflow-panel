"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, EyeOff, Info, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	deleteRfidAnomalies,
	dismissRfidAnomalies,
	type RfidAnomalyObservation,
	type RfidAnomalySelection,
	type RfidPagination,
	type RfidVisit,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { ConfirmDialog } from "./confirm-dialog";
import { OutcomeBadge, RfidTable } from "./rfid-table";
import { useServerSearch } from "./use-server-search";

function AnomalyBadges({ anomalies }: { anomalies: string[] }) {
	if (anomalies.length === 0)
		return <span className="text-muted-foreground">—</span>;
	return (
		<div className="flex max-w-56 flex-wrap gap-1">
			{anomalies.map((anomaly) => (
				<Badge
					key={anomaly}
					className="rounded-none bg-amber-100 text-amber-800 hover:bg-amber-100"
				>
					{anomaly.replaceAll("_", " ")}
				</Badge>
			))}
		</div>
	);
}

const columns: ColumnDef<RfidAnomalyObservation, unknown>[] = [
	{
		accessorKey: "captured_at",
		header: "Captured",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span>{formatDateTime(row.original.captured_at)}</span>
				<span className="text-muted-foreground text-sm">
					#{row.original.observation_id}
				</span>
			</div>
		),
	},
	{
		accessorKey: "station_key",
		header: "Station",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span>{row.original.station_key ?? "—"}</span>
				{row.original.role && (
					<span className="text-muted-foreground text-sm">
						role {row.original.role}
					</span>
				)}
			</div>
		),
	},
	{
		accessorKey: "tag_key",
		header: "Tag",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<code className="text-sm">{row.original.tag_key}</code>
				{row.original.ticket_name && (
					<span className="text-muted-foreground text-sm">
						{row.original.ticket_name}
					</span>
				)}
			</div>
		),
	},
	{
		id: "outcome",
		header: "Outcome (original → current)",
		cell: ({ row }) => (
			// The saved original reply never changes; a late offline binding or a
			// staff correction can change what the reading means now. Show both so
			// the operator sees what the gate was told versus what reports say.
			<div className="flex items-center gap-2">
				<OutcomeBadge outcome={row.original.original_outcome} />
				<ArrowRight className="size-4 text-muted-foreground" />
				<OutcomeBadge outcome={row.original.current_outcome} />
			</div>
		),
	},
	{
		accessorKey: "anomalies",
		header: "Anomalies",
		cell: ({ row }) => <AnomalyBadges anomalies={row.original.anomalies} />,
	},
	{
		accessorKey: "reason",
		header: "Reason",
		cell: ({ row }) =>
			row.original.reason ? (
				<span className="text-sm">{row.original.reason}</span>
			) : (
				<span className="text-muted-foreground">—</span>
			),
	},
];

function FlaggedVisits({ visits }: { visits: RfidVisit[] }) {
	if (visits.length === 0) return null;
	return (
		<div className="mt-6 space-y-2">
			<h3 className="font-semibold text-sm">Flagged visits</h3>
			<div className="space-y-2">
				{visits.map((visit) => (
					<div
						key={visit.id}
						className="flex flex-wrap items-center gap-2 border border-dashed bg-muted/40 p-3 text-sm"
					>
						<span className="font-medium">{visit.ticket_name ?? "—"}</span>
						<span className="text-muted-foreground">
							{visit.ticket_public_id ?? ""} · entered{" "}
							{formatDateTime(visit.entry_at)}
						</span>
						{visit.manual && (
							<Badge className="rounded-none bg-purple-100 text-purple-800 hover:bg-purple-100">
								manual exit
							</Badge>
						)}
						{visit.anomalies.map((anomaly) => (
							<Badge
								key={anomaly}
								className="rounded-none bg-amber-100 text-amber-800 hover:bg-amber-100"
							>
								{anomaly.replaceAll("_", " ")}
							</Badge>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

// Current outcomes a reading can carry (see OutcomeBadge).
const OUTCOMES = [
	"unknown_tag",
	"revoked_tag",
	"wrong_event",
	"ticket_invalid",
	"not_checked_in",
	"accepted",
];

const DISMISS_HELP =
	"Hide from this list and the anomaly count. The readings and visits stay in the data and the CSV, so nothing is lost.";
const DELETE_HELP =
	"Remove the readings for good, together with the visits built from them. Headcount can change. This cannot be undone.";

function WithHelp({
	help,
	children,
}: {
	help: string;
	children: React.ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				{/* span so a disabled button still shows its help */}
				<span className="inline-flex">{children}</span>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs">{help}</TooltipContent>
		</Tooltip>
	);
}

type Pending = { kind: "dismiss" | "delete"; selection: RfidAnomalySelection };

export function AnomaliesTab({
	eventId,
	observations,
	visits,
	pagination,
	page,
	onPageChange,
	onPerPageChange,
	stations,
	search,
	onSearchChange,
	outcome,
	onOutcomeChange,
	station,
	onStationChange,
	canAdmin,
}: {
	eventId: string;
	observations: RfidAnomalyObservation[];
	visits: RfidVisit[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (size: number) => void;
	stations: string[];
	search: string;
	onSearchChange: (value: string) => void;
	outcome: string;
	onOutcomeChange: (value: string) => void;
	station: string;
	onStationChange: (value: string) => void;
	canAdmin: boolean;
}) {
	const queryClient = useQueryClient();
	const [selected, setSelected] = useState<number[]>([]);
	const [pending, setPending] = useState<Pending | null>(null);
	const [searchDraft, setSearchDraft] = useServerSearch(
		search,
		onSearchChange,
		() => onPageChange(1),
	);
	// "All" actions ignore the filters, so they are off while one is active.
	const filtered = Boolean(search || outcome || station);

	const toggle = (id: number, on: boolean) =>
		setSelected((ids) =>
			on ? [...new Set([...ids, id])] : ids.filter((x) => x !== id),
		);
	const pageIds = observations.map((obs) => obs.observation_id);
	const allOnPage =
		pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

	const mutation = useMutation({
		mutationFn: ({ kind, selection }: Pending) =>
			kind === "dismiss"
				? dismissRfidAnomalies(eventId, selection)
				: deleteRfidAnomalies(eventId, selection),
		onSuccess: ({ affected }, { kind }) => {
			toast.success(
				`${affected} reading${affected === 1 ? "" : "s"} ${kind === "dismiss" ? "dismissed" : "deleted"}.`,
			);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			setSelected([]);
			setPending(null);
		},
		onError: (error) => toast.error(error.message),
	});

	const selectColumn: ColumnDef<RfidAnomalyObservation, unknown> = {
		id: "select",
		size: 40,
		enableHiding: false,
		enableSorting: false,
		header: () => (
			<Checkbox
				aria-label="Select all on this page"
				className="rounded-none"
				checked={allOnPage}
				onCheckedChange={(on) =>
					setSelected((ids) =>
						on === true
							? [...new Set([...ids, ...pageIds])]
							: ids.filter((id) => !pageIds.includes(id)),
					)
				}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				aria-label={`Select reading ${row.original.observation_id}`}
				className="rounded-none"
				checked={selected.includes(row.original.observation_id)}
				onCheckedChange={(on) =>
					toggle(row.original.observation_id, on === true)
				}
			/>
		),
	};

	const count = pagination?.total_count ?? observations.length;
	const isDelete = pending?.kind === "delete";
	const isAll = pending !== null && "all" in pending.selection;
	const n =
		pending && "ids" in pending.selection
			? pending.selection.ids.length
			: count;

	return (
		<div>
			{canAdmin && selected.length === 0 && (
				<div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-l-4 border-l-blue-500 bg-blue-50 px-4 py-2.5 dark:bg-blue-950/30">
					<span className="flex items-center gap-2 text-blue-900 text-sm dark:text-blue-100">
						<Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
						<span>
							Tick readings below, then <strong>Dismiss</strong> to hide them
							(data is kept) or <strong>Delete</strong> to remove them{" "}
							<strong className="text-red-600 dark:text-red-400">
								permanently
							</strong>
							.
						</span>
					</span>
					<div className="flex items-center gap-2">
						<WithHelp help={DISMISS_HELP}>
							<Button
								variant="outline"
								size="sm"
								className="rounded-none bg-background"
								disabled={count === 0 || filtered}
								title={
									filtered
										? "Clear the search and filters to act on every anomaly"
										: undefined
								}
								onClick={() =>
									setPending({ kind: "dismiss", selection: { all: true } })
								}
							>
								<EyeOff className="size-4" />
								Dismiss all
							</Button>
						</WithHelp>
						<WithHelp help={DELETE_HELP}>
							<Button
								variant="outline"
								size="sm"
								className="rounded-none bg-background text-destructive"
								disabled={count === 0 || filtered}
								title={
									filtered
										? "Clear the search and filters to act on every anomaly"
										: undefined
								}
								onClick={() =>
									setPending({ kind: "delete", selection: { all: true } })
								}
							>
								<Trash2 className="size-4" />
								Delete all
							</Button>
						</WithHelp>
					</div>
				</div>
			)}
			{canAdmin && selected.length > 0 && (
				<div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-l-4 border-l-primary bg-muted/50 px-4 py-2.5">
					<span className="flex items-center gap-2 font-medium text-sm">
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-semibold text-primary-foreground text-xs">
							{selected.length}
						</span>
						selected
					</span>
					<div className="flex items-center gap-2">
						<WithHelp help={DISMISS_HELP}>
							<Button
								variant="outline"
								size="sm"
								className="rounded-none"
								onClick={() =>
									setPending({ kind: "dismiss", selection: { ids: selected } })
								}
							>
								Dismiss
							</Button>
						</WithHelp>
						<WithHelp help={DELETE_HELP}>
							<Button
								variant="destructive"
								size="sm"
								className="rounded-none"
								onClick={() =>
									setPending({ kind: "delete", selection: { ids: selected } })
								}
							>
								Delete
							</Button>
						</WithHelp>
						<div className="mx-1 h-5 w-px bg-border" />
						<Button
							variant="ghost"
							size="sm"
							className="rounded-none"
							onClick={() => setSelected([])}
						>
							Clear
						</Button>
					</div>
				</div>
			)}
			<RfidTable
				control={{
					search: {
						placeholder: "Search guest, ticket ID or sticker...",
						enableCustomSearch: false,
						controlled: { value: searchDraft, onChange: setSearchDraft },
					},
					filters: [
						{
							label: "Outcome",
							columnId: "outcome",
							type: "filter",
							data: [
								{ label: "All", value: "all" },
								...OUTCOMES.map((value) => ({
									label: value.replaceAll("_", " "),
									value,
								})),
							],
							customFilter: {
								value: outcome || "all",
								onChange: (value) => {
									onOutcomeChange(value === "all" ? "" : value);
									onPageChange(1);
								},
							},
						},
						{
							label: "Station",
							columnId: "station",
							type: "filter",
							data: [
								{ label: "All", value: "all" },
								...stations.map((key) => ({ label: key, value: key })),
							],
							customFilter: {
								value: station || "all",
								onChange: (value) => {
									onStationChange(value === "all" ? "" : value);
									onPageChange(1);
								},
							},
						},
					],
				}}
				columns={canAdmin ? [selectColumn, ...columns] : columns}
				data={observations}
				emptyTitle={
					search || outcome || station ? "No anomalies match" : "No anomalies"
				}
				emptyDescription={
					search || outcome || station
						? "Try a different search or clear the filters."
						: "Readings the gates could not accept, or whose meaning changed, appear here."
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
				renderMobileCard={(obs) => (
					<Item variant="outline" className="w-full rounded-none">
						<ItemHeader className="flex flex-col items-start gap-1">
							<ItemTitle className="w-full justify-between">
								<span className="font-bold text-base">
									{obs.ticket_name ?? obs.tag_key}
								</span>
								<span className="text-muted-foreground text-xs">
									#{obs.observation_id}
								</span>
							</ItemTitle>
							<ItemDescription>
								{formatDateTime(obs.captured_at)} · {obs.station_key ?? "—"}
								{obs.role ? ` · ${obs.role}` : ""}
							</ItemDescription>
						</ItemHeader>
						<ItemContent className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<OutcomeBadge outcome={obs.original_outcome} />
								<ArrowRight className="size-4 text-muted-foreground" />
								<OutcomeBadge outcome={obs.current_outcome} />
							</div>
							<AnomalyBadges anomalies={obs.anomalies} />
							{canAdmin && (
								<div className="flex items-center gap-2 text-xs">
									<Checkbox
										id={`anomaly-select-${obs.observation_id}`}
										checked={selected.includes(obs.observation_id)}
										onCheckedChange={(on) =>
											toggle(obs.observation_id, on === true)
										}
									/>
									<label htmlFor={`anomaly-select-${obs.observation_id}`}>
										Select
									</label>
								</div>
							)}
							{obs.reason && (
								<p className="text-muted-foreground text-xs">{obs.reason}</p>
							)}
						</ItemContent>
					</Item>
				)}
			/>
			<FlaggedVisits visits={visits} />
			<ConfirmDialog
				open={pending !== null}
				onOpenChange={(open) => !open && setPending(null)}
				title={
					isDelete
						? `Delete ${isAll ? "all" : n} reading${n === 1 ? "" : "s"}?`
						: `Dismiss ${isAll ? "all" : n} reading${n === 1 ? "" : "s"}?`
				}
				description={
					isDelete
						? "The readings are removed for good, together with the visits built from them, so headcount can change. Accepted readings that only carry a flag are removed too. It cannot be undone."
						: "They leave this list and the anomaly count. The readings and visits stay in the data and the CSV."
				}
				confirmLabel={isDelete ? "Delete" : "Dismiss"}
				pending={mutation.isPending}
				onConfirm={() => pending && mutation.mutate(pending)}
			/>
		</div>
	);
}
