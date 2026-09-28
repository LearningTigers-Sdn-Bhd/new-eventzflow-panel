"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { RfidPagination, RfidVisit } from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { ManualExitDialog } from "./manual-exit-dialog";
import { formatDuration, RfidTable } from "./rfid-table";

function VisitBadges({ visit }: { visit: RfidVisit }) {
	return (
		<div className="flex flex-wrap items-center gap-1">
			<Badge
				className={cn(
					"rounded-none",
					visit.status === "open"
						? "bg-green-100 text-green-800 hover:bg-green-100"
						: "bg-gray-100 text-gray-800 hover:bg-gray-100",
				)}
			>
				{visit.status}
			</Badge>
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
	);
}

export function VisitsTab({
	eventId,
	visits,
	pagination,
	page,
	onPageChange,
	canUpdate,
}: {
	eventId: string;
	visits: RfidVisit[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
	canUpdate: boolean;
}) {
	const [selected, setSelected] = useState<RfidVisit | null>(null);

	const columns: ColumnDef<RfidVisit, unknown>[] = [
		{
			accessorKey: "ticket_name",
			header: "Ticket",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<span className="font-medium">{row.original.ticket_name ?? "—"}</span>
					<span className="text-muted-foreground text-sm">
						{row.original.ticket_public_id ?? ""}
						{row.original.ticket_type ? ` · ${row.original.ticket_type}` : ""}
					</span>
				</div>
			),
		},
		{
			accessorKey: "entry_at",
			header: "Entry",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<span>{formatDateTime(row.original.entry_at)}</span>
					{row.original.entry_station && (
						<span className="text-muted-foreground text-sm">
							{row.original.entry_station}
						</span>
					)}
				</div>
			),
		},
		{
			accessorKey: "exit_at",
			header: "Exit",
			cell: ({ row }) =>
				row.original.exit_at ? (
					<div className="flex flex-col gap-1">
						<span>{formatDateTime(row.original.exit_at)}</span>
						{row.original.exit_station && (
							<span className="text-muted-foreground text-sm">
								{row.original.exit_station}
							</span>
						)}
					</div>
				) : (
					<span className="text-muted-foreground">—</span>
				),
		},
		{
			accessorKey: "duration_seconds",
			header: "Duration",
			cell: ({ row }) =>
				// Duration exists only for closed visits; open visits show nothing
				// inferred.
				row.original.status === "closed"
					? formatDuration(row.original.duration_seconds)
					: "—",
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => <VisitBadges visit={row.original} />,
		},
		{
			id: "actions",
			header: "",
			cell: ({ row }) =>
				canUpdate && row.original.status === "open" ? (
					<Button
						variant="outline"
						size="sm"
						className="rounded-none"
						onClick={() => setSelected(row.original)}
					>
						<LogOut className="size-4" />
						Manual exit
					</Button>
				) : null,
		},
	];

	return (
		<>
			<RfidTable
				columns={columns}
				data={visits}
				emptyTitle="No visits yet"
				emptyDescription="Visits appear once gates accept entries for this event."
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
				renderMobileCard={(visit) => (
					<Item variant="outline" className="w-full rounded-none">
						<ItemHeader className="flex flex-col items-start gap-1">
							<ItemTitle className="w-full justify-between">
								<span className="font-bold text-base">
									{visit.ticket_name ?? "—"}
								</span>
							</ItemTitle>
							<ItemDescription className="font-mono text-xs">
								{visit.ticket_public_id ?? ""}
								{visit.ticket_type ? ` · ${visit.ticket_type}` : ""}
							</ItemDescription>
							<VisitBadges visit={visit} />
						</ItemHeader>
						<ItemContent className="space-y-1 text-muted-foreground text-sm">
							<p>
								In: {formatDateTime(visit.entry_at)}
								{visit.entry_station ? ` (${visit.entry_station})` : ""}
							</p>
							<p>
								Out:{" "}
								{visit.exit_at
									? `${formatDateTime(visit.exit_at)}${visit.exit_station ? ` (${visit.exit_station})` : ""}`
									: "—"}
							</p>
							{visit.status === "closed" && (
								<p>Duration: {formatDuration(visit.duration_seconds)}</p>
							)}
							{canUpdate && visit.status === "open" && (
								<Button
									variant="outline"
									size="sm"
									className="mt-2 rounded-none"
									onClick={() => setSelected(visit)}
								>
									<LogOut className="size-4" />
									Manual exit
								</Button>
							)}
						</ItemContent>
					</Item>
				)}
			/>
			<ManualExitDialog
				eventId={eventId}
				visit={selected}
				canUpdate={canUpdate}
				open={selected !== null}
				onOpenChange={(open) => !open && setSelected(null)}
			/>
		</>
	);
}
