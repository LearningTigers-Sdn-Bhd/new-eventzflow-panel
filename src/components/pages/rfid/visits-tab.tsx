"use client";

import {
	ArrowRight,
	ChevronDown,
	ChevronRight,
	LogOut,
	MessageCircle,
	Plus,
} from "lucide-react";
import { Fragment, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	RfidGuestVisits,
	RfidPagination,
	RfidVisit,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { AttendanceCheckDialog } from "./attendance-check-dialog";
import { ManualEntryDialog } from "./manual-entry-dialog";
import { ManualExitDialog } from "./manual-exit-dialog";
import {
	formatDuration,
	RfidControlBar,
	RfidPager,
	useRfidTable,
} from "./rfid-table";
import { useServerSearch } from "./use-server-search";

type StatusFilter = "inside" | "outside" | undefined;

// Closed visits show their recorded duration; an open visit shows how long
// the guest has been inside so far (refreshes with the 10s poll).
function formatVisitDuration(visit: RfidVisit): string {
	if (visit.status === "closed") return formatDuration(visit.duration_seconds);
	if (!visit.entry_at) return "—";
	const seconds = Math.max(
		0,
		Math.round((Date.now() - new Date(visit.entry_at).getTime()) / 1000),
	);
	return `${formatDuration(seconds)} so far`;
}

const ms = (iso: string) => new Date(iso).getTime();

const shortTime = (iso: string) =>
	new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

const secondsBetween = (from: string, to: string) =>
	Math.max(0, Math.round((ms(to) - ms(from)) / 1000));

// What one guest did, oldest to newest: where they were in the hall (green
// blocks), how long they were out between visits, and every gate visit.
function GuestTimeline({
	guest,
	canUpdate,
	onManualExit,
}: {
	guest: RfidGuestVisits;
	canUpdate: boolean;
	onManualExit: (visit: RfidVisit) => void;
}) {
	const visits = [...guest.visits].reverse().filter((visit) => visit.entry_at);
	const nowIso = new Date().toISOString();
	const endOf = (visit: RfidVisit) => visit.exit_at ?? nowIso;
	const start = ms(visits[0].entry_at as string);
	const end = Math.max(...visits.map((visit) => ms(endOf(visit))));
	const total = Math.max(end - start, 1);
	const gaps = visits.slice(1).map((visit, index) => ({
		from: endOf(visits[index]),
		to: visit.entry_at as string,
	}));
	const awaySeconds = gaps.reduce(
		(sum, gap) => sum + secondsBetween(gap.from, gap.to),
		0,
	);

	return (
		<div className="space-y-4">
			{visits.length > 1 && (
				<div>
					<p className="mb-1 font-medium text-xs">
						Timeline
						<span className="ml-2 font-normal text-muted-foreground">
							(green = inside, blank = outside)
						</span>
						<span className="ml-2 font-normal text-muted-foreground">
							· outside for {formatDuration(awaySeconds)} in total
						</span>
					</p>
					<div className="relative h-8 border bg-background">
						{visits.map((visit) => (
							<div
								key={visit.id}
								className="absolute inset-y-1 bg-emerald-500"
								style={{
									left: `${((ms(visit.entry_at as string) - start) / total) * 100}%`,
									width: `${Math.max(((ms(endOf(visit)) - ms(visit.entry_at as string)) / total) * 100, 0.4)}%`,
								}}
								title={`${shortTime(visit.entry_at as string)} to ${visit.exit_at ? shortTime(visit.exit_at) : "now"}`}
							/>
						))}
					</div>
					<div className="mt-1 flex justify-between text-muted-foreground text-xs tabular-nums">
						<span>{formatDateTime(visits[0].entry_at)}</span>
						<span>
							{guest.status === "inside"
								? "now"
								: formatDateTime(guest.last_out)}
						</span>
					</div>
				</div>
			)}

			<ol className="space-y-1.5">
				{visits.map((visit, index) => (
					<li key={visit.id} className="space-y-1.5">
						<div
							className={cn(
								"flex flex-wrap items-center gap-x-4 gap-y-2 border border-l-4 bg-background px-3 py-2.5 text-sm",
								visit.status === "open"
									? "border-l-emerald-500"
									: "border-l-slate-300",
							)}
						>
							<span className="font-medium">Visit {index + 1}</span>
							<span className="flex flex-wrap items-center gap-2 tabular-nums">
								<span>
									{formatDateTime(visit.entry_at)}
									{visit.entry_station && (
										<span className="ml-1 text-muted-foreground text-xs">
											{visit.entry_station}
										</span>
									)}
								</span>
								<ArrowRight className="size-3.5 text-muted-foreground" />
								<span>
									{visit.exit_at ? (
										<>
											{formatDateTime(visit.exit_at)}
											{visit.exit_station && (
												<span className="ml-1 text-muted-foreground text-xs">
													{visit.exit_station}
												</span>
											)}
										</>
									) : (
										<span className="font-medium text-green-700">
											still inside
										</span>
									)}
								</span>
							</span>
							<Badge
								className={cn(
									"rounded-none",
									visit.status === "open"
										? "bg-green-100 text-green-800 hover:bg-green-100"
										: "bg-slate-100 text-slate-800 hover:bg-slate-100",
								)}
							>
								{formatVisitDuration(visit)}
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
							{canUpdate && visit.status === "open" && (
								<Button
									variant="outline"
									size="sm"
									className="ml-auto rounded-none"
									onClick={(e) => {
										e.stopPropagation();
										onManualExit(visit);
									}}
								>
									<LogOut className="size-4" />
									Manual exit
								</Button>
							)}
						</div>
						{gaps[index] && (
							<div className="ml-4 flex items-center gap-2 text-muted-foreground text-xs">
								<span className="h-px w-4 border-t" />
								Outside for{" "}
								{formatDuration(
									secondsBetween(gaps[index].from, gaps[index].to),
								)}{" "}
								({shortTime(gaps[index].from)} → {shortTime(gaps[index].to)})
							</div>
						)}
					</li>
				))}
			</ol>
		</div>
	);
}

function GuestRow({
	guest,
	open,
	onToggle,
	canUpdate,
	onManualExit,
}: {
	guest: RfidGuestVisits;
	open: boolean;
	onToggle: () => void;
	canUpdate: boolean;
	onManualExit: (visit: RfidVisit) => void;
}) {
	return (
		<Fragment>
			<tr
				className="cursor-pointer border-t hover:bg-accent/50"
				onClick={onToggle}
			>
				<td className="w-8 px-3 py-3 text-muted-foreground">
					{open ? (
						<ChevronDown className="size-4" />
					) : (
						<ChevronRight className="size-4" />
					)}
				</td>
				<td className="px-3 py-3">
					<div className="font-medium">{guest.ticket_name ?? "—"}</div>
					<div className="text-muted-foreground text-xs">
						{guest.ticket_public_id ?? ""}
					</div>
				</td>
				<td className="px-3 py-3 text-sm">{guest.ticket_type ?? "—"}</td>
				<td className="px-3 py-3 text-sm">{formatDateTime(guest.first_in)}</td>
				<td className="px-3 py-3 text-sm">
					{guest.status === "inside" ? (
						<span className="text-muted-foreground">—</span>
					) : (
						formatDateTime(guest.last_out)
					)}
				</td>
				<td className="px-3 py-3 tabular-nums">
					{formatDuration(guest.total_seconds)}
				</td>
				<td className="px-3 py-3 tabular-nums">
					{guest.visit_count}{" "}
					<span className="text-muted-foreground">
						{guest.visit_count === 1 ? "visit" : "visits"}
					</span>
				</td>
				<td className="px-3 py-3">
					<div className="flex flex-wrap items-center gap-1">
						<Badge
							className={cn(
								"rounded-none",
								guest.status === "inside"
									? "bg-green-100 text-green-800 hover:bg-green-100"
									: "bg-gray-100 text-gray-800 hover:bg-gray-100",
							)}
						>
							{guest.status}
						</Badge>
						{guest.manual && (
							<Badge className="rounded-none bg-purple-100 text-purple-800 hover:bg-purple-100">
								manual exit
							</Badge>
						)}
						{guest.anomalies.length > 0 && (
							<Badge className="rounded-none bg-amber-100 text-amber-800 hover:bg-amber-100">
								{guest.anomalies.length} anomaly
							</Badge>
						)}
					</div>
				</td>
			</tr>
			{open && (
				<tr className="bg-muted/30">
					<td />
					<td colSpan={7} className="px-3 py-4">
						<GuestTimeline
							guest={guest}
							canUpdate={canUpdate}
							onManualExit={onManualExit}
						/>
					</td>
				</tr>
			)}
		</Fragment>
	);
}

export function VisitsTab({
	eventId,
	guests,
	ticketTypes,
	pagination,
	page,
	onPageChange,
	onPerPageChange,
	ticketType,
	onTicketTypeChange,
	status,
	onStatusChange,
	search,
	onSearchChange,
	canUpdate,
}: {
	eventId: string;
	guests: RfidGuestVisits[];
	ticketTypes: { id: number; name: string }[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
	onPerPageChange: (size: number) => void;
	ticketType: string;
	onTicketTypeChange: (value: string) => void;
	status: StatusFilter;
	onStatusChange: (status: StatusFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
	canUpdate: boolean;
}) {
	const [selected, setSelected] = useState<RfidVisit | null>(null);
	const [addOpen, setAddOpen] = useState(false);
	const [checkOpen, setCheckOpen] = useState(false);
	const [openId, setOpenId] = useState<number | null>(null);
	const [searchDraft, setSearchDraft] = useServerSearch(
		search,
		onSearchChange,
		() => onPageChange(1),
	);

	const paging = pagination
		? {
				pageIndex: page - 1,
				pageSize: pagination.per_page,
				pageCount: pagination.total_pages,
				totalCount: pagination.total_count,
				onPageChange: (pageIndex: number) => onPageChange(pageIndex + 1),
				onPageSizeChange: (size: number) => {
					onPerPageChange(size);
					onPageChange(1);
				},
			}
		: undefined;
	// The expandable body below is custom; this table instance only drives the
	// shared toolbar and footer.
	const table = useRfidTable<RfidGuestVisits>([], guests, paging);

	return (
		<>
			{canUpdate && (
				<div className="mb-3 flex flex-wrap justify-end gap-2">
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => setCheckOpen(true)}
					>
						<MessageCircle className="size-4" />
						WhatsApp check
					</Button>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => setAddOpen(true)}
					>
						<Plus className="size-4" />
						Add missed visit
					</Button>
				</div>
			)}
			<RfidControlBar
				table={table}
				control={{
					search: {
						placeholder: "Search name, email, phone or ticket ID...",
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
								{ label: "Inside now", value: "inside" },
								{ label: "Left", value: "outside" },
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
			/>

			<div className="overflow-x-auto border">
				<table className="w-full min-w-[820px] text-left text-sm">
					<thead className="text-muted-foreground text-xs">
						<tr>
							<th className="w-8" />
							<th className="px-3 py-2 font-medium">Guest</th>
							<th className="px-3 py-2 font-medium">Ticket type</th>
							<th className="px-3 py-2 font-medium">First in</th>
							<th className="px-3 py-2 font-medium">Last out</th>
							<th className="px-3 py-2 font-medium">Total time inside</th>
							<th className="px-3 py-2 font-medium">Gate visits</th>
							<th className="px-3 py-2 font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{guests.map((guest) => (
							<GuestRow
								key={guest.ticket_id}
								guest={guest}
								open={openId === guest.ticket_id}
								onToggle={() =>
									setOpenId(openId === guest.ticket_id ? null : guest.ticket_id)
								}
								canUpdate={canUpdate}
								onManualExit={setSelected}
							/>
						))}
					</tbody>
				</table>
				{guests.length === 0 && (
					<p className="p-8 text-center text-muted-foreground text-sm">
						{search || status || ticketType
							? "No guests match this search."
							: "Visits appear once gates accept entries for this event."}
					</p>
				)}
			</div>

			{paging && <RfidPager table={table} pagination={paging} />}

			{checkOpen && (
				<AttendanceCheckDialog
					eventId={eventId}
					open={checkOpen}
					onOpenChange={setCheckOpen}
				/>
			)}

			{addOpen && (
				<ManualEntryDialog
					eventId={eventId}
					open={addOpen}
					onOpenChange={setAddOpen}
				/>
			)}

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
