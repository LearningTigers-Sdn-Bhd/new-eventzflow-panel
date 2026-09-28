"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type {
	RfidAnomalyObservation,
	RfidPagination,
	RfidVisit,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { OutcomeBadge, RfidTable } from "./rfid-table";

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

export function AnomaliesTab({
	observations,
	visits,
	pagination,
	page,
	onPageChange,
}: {
	observations: RfidAnomalyObservation[];
	visits: RfidVisit[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
}) {
	return (
		<div>
			<RfidTable
				columns={columns}
				data={observations}
				emptyTitle="No anomalies"
				emptyDescription="Readings the gates could not accept, or whose meaning changed, appear here."
				pagination={
					pagination
						? {
								pageIndex: page - 1,
								pageSize: pagination.per_page,
								pageCount: pagination.total_pages,
								totalCount: pagination.total_count,
								onPageChange: (pageIndex) => onPageChange(pageIndex + 1),
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
							{obs.reason && (
								<p className="text-muted-foreground text-xs">{obs.reason}</p>
							)}
						</ItemContent>
					</Item>
				)}
			/>
			<FlaggedVisits visits={visits} />
		</div>
	);
}
