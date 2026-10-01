"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangle,
	CheckCircle2,
	DoorOpen,
	Radio,
	ScanLine,
	TicketX,
	WifiOff,
} from "lucide-react";
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	RfidFlow,
	RfidMissedReason,
	RfidMissedScan,
	RfidPagination,
	RfidSession,
	RfidStation,
	RfidSummary,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { RfidTable } from "./rfid-table";
import { useServerSearch } from "./use-server-search";

export const RFID_TABS = [
	"dashboard",
	"sessions",
	"stations",
	"bindings",
	"visits",
	"anomalies",
] as const;
export type RfidTabName = (typeof RFID_TABS)[number];

const REASON_LABEL: Record<RfidMissedReason, string> = {
	no_tag: "No sticker linked",
	no_read: "Sticker linked, no gate read",
};

export type FlowPreset = "all" | "1h" | "3h" | "custom";
export type FlowRange = { preset: FlowPreset; from?: string; to?: string };

const PRESET_LABEL: Record<FlowPreset, string> = {
	all: "Whole event",
	"1h": "Last hour",
	"3h": "Last 3 hours",
	custom: "Custom range",
};

// Presets are relative to "now", so they are resolved on every fetch.
export function resolveFlowRange(range: FlowRange): {
	from?: string;
	to?: string;
} {
	const minutesAgo = (n: number) => {
		const date = new Date(Date.now() - n * 60_000);
		date.setSeconds(0, 0);
		return date.toISOString();
	};
	if (range.preset === "1h") return { from: minutesAgo(60) };
	if (range.preset === "3h") return { from: minutesAgo(180) };
	if (range.preset === "custom") {
		return {
			from: range.from ? new Date(range.from).toISOString() : undefined,
			to: range.to ? new Date(range.to).toISOString() : undefined,
		};
	}
	return {};
}

// A gate that has not heartbeated for this long is probably unplugged.
const STATION_SILENT_MINUTES = 5;

const flowConfig = {
	entries: { label: "Entered", color: "var(--chart-2)" },
	exits: { label: "Left", color: "var(--chart-4)" },
	inside: { label: "Inside", color: "var(--chart-1)" },
} satisfies ChartConfig;

const pct = (part: number, whole: number) =>
	whole > 0 ? Math.round((part / whole) * 100) : 0;

const clock = (iso: string) =>
	new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});

function ReasonBadge({ reason }: { reason: RfidMissedReason }) {
	return (
		<Badge
			className={
				reason === "no_read"
					? "rounded-none bg-amber-100 text-amber-800 hover:bg-amber-100"
					: "rounded-none bg-gray-100 text-gray-800 hover:bg-gray-100"
			}
		>
			{REASON_LABEL[reason]}
		</Badge>
	);
}

const missedColumns: ColumnDef<RfidMissedScan, unknown>[] = [
	{
		accessorKey: "ticket_name",
		header: "Ticket",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1">
				<span className="font-medium">{row.original.ticket_name}</span>
				<span className="text-muted-foreground text-sm">
					{row.original.ticket_public_id}
					{row.original.ticket_type ? ` · ${row.original.ticket_type}` : ""}
				</span>
			</div>
		),
	},
	{
		accessorKey: "checked_in_at",
		header: "Checked in at desk",
		cell: ({ row }) => formatDateTime(row.original.checked_in_at),
	},
	{
		accessorKey: "reason",
		header: "Why no gate read",
		cell: ({ row }) => <ReasonBadge reason={row.original.reason} />,
	},
];

function SectionCard({
	title,
	description,
	children,
	className,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Card className={cn("gap-0 rounded-none shadow-none", className)}>
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-sm">{title}</CardTitle>
				{description && (
					<CardDescription className="text-xs">{description}</CardDescription>
				)}
			</CardHeader>
			<CardContent className="pt-4">{children}</CardContent>
		</Card>
	);
}

function StatTile({
	label,
	value,
	hint,
	accent,
	onClick,
}: {
	label: string;
	value: number;
	hint: string;
	accent: string;
	onClick?: () => void;
}) {
	const body = (
		<>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-1 font-bold text-2xl tabular-nums leading-none">
				{value.toLocaleString()}
			</p>
			<p className="mt-1.5 text-muted-foreground text-xs">{hint}</p>
		</>
	);
	const className = cn(
		"flex flex-col justify-center border border-l-4 p-3 text-left",
		accent,
	);
	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			className={cn(className, "transition-colors hover:bg-accent")}
		>
			{body}
		</button>
	) : (
		<div className={className}>{body}</div>
	);
}

function FunnelRow({
	label,
	value,
	of,
	hint,
	tone,
}: {
	label: string;
	value: number;
	of: number;
	hint?: string;
	tone: string;
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-baseline justify-between gap-2 text-sm">
				<span className="font-medium">{label}</span>
				<span className="tabular-nums">
					<span className="font-bold text-base">{value.toLocaleString()}</span>
					<span className="ml-2 text-muted-foreground">{pct(value, of)}%</span>
				</span>
			</div>
			<div className="h-2.5 w-full bg-muted">
				<div
					className={cn("h-full transition-all", tone)}
					style={{ width: `${pct(value, of)}%` }}
				/>
			</div>
			{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
		</div>
	);
}

function AlertRow({
	icon,
	tone,
	title,
	detail,
	action,
}: {
	icon: React.ReactNode;
	tone: string;
	title: string;
	detail: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex items-start gap-3 border p-3">
			<div className={cn("mt-0.5 shrink-0", tone)}>{icon}</div>
			<div className="min-w-0 flex-1">
				<p className="font-medium text-sm">{title}</p>
				<p className="text-muted-foreground text-xs">{detail}</p>
			</div>
			{action}
		</div>
	);
}

function SessionRow({
	session,
	registered,
}: {
	session: RfidSession;
	registered: number;
}) {
	const statusClass =
		session.status === "live"
			? "bg-green-100 text-green-800 hover:bg-green-100"
			: session.status === "upcoming"
				? "bg-blue-100 text-blue-800 hover:bg-blue-100"
				: "bg-gray-100 text-gray-800 hover:bg-gray-100";
	return (
		<div className="space-y-1.5 border p-3">
			<div className="flex flex-wrap items-center gap-2">
				<span className="font-medium text-sm">{session.name}</span>
				<Badge className={cn("rounded-none", statusClass)}>
					{session.status}
				</Badge>
				{!session.mandatory && (
					<Badge className="rounded-none bg-gray-100 text-gray-800 hover:bg-gray-100">
						optional
					</Badge>
				)}
				<span className="ml-auto text-muted-foreground text-xs">
					{clock(session.starts_at)} – {clock(session.ends_at)}
				</span>
			</div>
			<div className="h-2 w-full bg-muted">
				<div
					className="h-full bg-emerald-500"
					style={{ width: `${pct(session.attended, registered)}%` }}
				/>
			</div>
			<p className="text-muted-foreground text-xs">
				<span className="font-semibold text-foreground">
					{session.attended.toLocaleString()}
				</span>{" "}
				attended · {(session.present - session.attended).toLocaleString()} came
				but not long enough
			</p>
		</div>
	);
}

export function DashboardTab({
	summary,
	summaryTicketType,
	onSummaryTicketTypeChange,
	flow,
	flowRange,
	onFlowRangeChange,
	ticketTypes,
	search,
	onSearchChange,
	ticketType,
	onTicketTypeChange,
	sessions,
	attendancePercent,
	stations,
	missed,
	pagination,
	page,
	onPageChange,
	reason,
	onReasonChange,
	onPerPageChange,
	onNavigate,
}: {
	summary: RfidSummary;
	summaryTicketType: string;
	onSummaryTicketTypeChange: (value: string) => void;
	flow: RfidFlow | undefined;
	flowRange: FlowRange;
	onFlowRangeChange: (range: FlowRange) => void;
	ticketTypes: { id: number; name: string }[];
	search: string;
	onSearchChange: (value: string) => void;
	ticketType: string;
	onTicketTypeChange: (value: string) => void;
	sessions: RfidSession[];
	attendancePercent: number;
	stations: RfidStation[];
	missed: RfidMissedScan[];
	pagination: RfidPagination | undefined;
	page: number;
	onPageChange: (page: number) => void;
	reason: RfidMissedReason | undefined;
	onReasonChange: (reason: RfidMissedReason | undefined) => void;
	onPerPageChange: (size: number) => void;
	onNavigate: (tab: RfidTabName) => void;
}) {
	const missedTotal =
		summary.missed_scans.no_tag + summary.missed_scans.no_read;

	const [searchDraft, setSearchDraft] = useServerSearch(
		search,
		onSearchChange,
		() => onPageChange(1),
	);

	const buckets = flow?.buckets ?? [];
	const multiDay =
		buckets.length > 1 &&
		new Date(buckets[buckets.length - 1].at).getTime() -
			new Date(buckets[0].at).getTime() >
			24 * 3600 * 1000;
	const tick = (iso: string) =>
		multiDay
			? new Date(iso).toLocaleString("en-US", {
					month: "short",
					day: "numeric",
					hour: "numeric",
				})
			: clock(iso);

	const silentGates = stations.filter(
		(station) =>
			station.kind === "gate" &&
			station.last_heartbeat_at &&
			Date.now() - new Date(station.last_heartbeat_at).getTime() >
				STATION_SILENT_MINUTES * 60 * 1000,
	);

	const alerts: React.ReactNode[] = [];
	if (summary.missed_scans.no_read > 0) {
		alerts.push(
			<AlertRow
				key="no_read"
				icon={<ScanLine className="size-4" />}
				tone="text-amber-600"
				title={`${summary.missed_scans.no_read} checked in, sticker never read`}
				detail="They have a sticker but no gate has seen it yet."
				action={
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => {
							onReasonChange("no_read");
							onPageChange(1);
							document
								.getElementById("rfid-missed-scans")
								?.scrollIntoView({ behavior: "smooth" });
						}}
					>
						Review
					</Button>
				}
			/>,
		);
	}
	if (summary.missed_scans.no_tag > 0) {
		alerts.push(
			<AlertRow
				key="no_tag"
				icon={<TicketX className="size-4" />}
				tone="text-gray-500"
				title={`${summary.missed_scans.no_tag} checked in without a sticker`}
				detail="No sticker is linked, so gates cannot see them."
				action={
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => {
							onReasonChange("no_tag");
							onPageChange(1);
							document
								.getElementById("rfid-missed-scans")
								?.scrollIntoView({ behavior: "smooth" });
						}}
					>
						Review
					</Button>
				}
			/>,
		);
	}
	if (summary.anomaly_count > 0) {
		alerts.push(
			<AlertRow
				key="anomalies"
				icon={<AlertTriangle className="size-4" />}
				tone="text-red-600"
				title={`${summary.anomaly_count} readings need review`}
				detail="Unknown stickers, repeated entries or unmatched exits."
				action={
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => onNavigate("anomalies")}
					>
						Open
					</Button>
				}
			/>,
		);
	}
	for (const station of silentGates) {
		alerts.push(
			<AlertRow
				key={station.id}
				icon={<WifiOff className="size-4" />}
				tone="text-red-600"
				title={`${station.name ?? station.station_key} is silent`}
				detail={`No heartbeat since ${clock(station.last_heartbeat_at as string)}. Check the gate PC and cable.`}
				action={
					<Button
						size="sm"
						variant="outline"
						className="rounded-none"
						onClick={() => onNavigate("stations")}
					>
						Stations
					</Button>
				}
			/>,
		);
	}

	const filters: { value: RfidMissedReason | undefined; label: string }[] = [
		{ value: undefined, label: `All (${missedTotal})` },
		{
			value: "no_read",
			label: `${REASON_LABEL.no_read} (${summary.missed_scans.no_read})`,
		},
		{
			value: "no_tag",
			label: `${REASON_LABEL.no_tag} (${summary.missed_scans.no_tag})`,
		},
	];

	return (
		<div className="space-y-4">
			{/* Live strip */}
			<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
				<span className="relative flex size-2">
					<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
					<span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
				</span>
				<span className="font-medium text-foreground">Live</span>
				<span>refreshes every 10 seconds</span>
				<span>·</span>
				<span>
					Last gate read:{" "}
					{summary.last_observed_at
						? formatDateTime(summary.last_observed_at)
						: "none yet"}
				</span>
				<div className="ml-auto">
					<Select
						value={summaryTicketType || "all"}
						onValueChange={(value) =>
							onSummaryTicketTypeChange(value === "all" ? "" : value)
						}
					>
						<SelectTrigger
							className="w-52 rounded-none text-foreground"
							aria-label="Filter the overview by ticket type"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All ticket types</SelectItem>
							{summary.ticket_types.map((type) => (
								<SelectItem key={type.id} value={String(type.id)}>
									{type.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				{/* Hero: where everyone is right now */}
				<Card className="h-full gap-0 rounded-none shadow-none">
					<CardHeader className="border-b pb-3">
						<CardTitle className="flex items-center gap-2 text-sm">
							<DoorOpen className="size-4" />
							Live venue status
						</CardTitle>
						<CardDescription className="text-xs">
							Where guests are right now
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col gap-5 pt-5">
						<div className="space-y-3">
							<div className="grid grid-cols-2">
								<div className="pr-4">
									<p className="flex items-center gap-1.5 font-medium text-emerald-700 text-xs uppercase tracking-wide dark:text-emerald-400">
										<span className="size-2 bg-emerald-500" />
										Inside
									</p>
									<p className="mt-1 font-bold text-5xl text-emerald-600 tabular-nums leading-none dark:text-emerald-400">
										{summary.inside.toLocaleString()}
									</p>
								</div>
								<div className="border-l pl-4">
									<p className="flex items-center gap-1.5 font-medium text-amber-700 text-xs uppercase tracking-wide dark:text-amber-400">
										<span className="size-2 bg-amber-500" />
										Outside
									</p>
									<p className="mt-1 font-bold text-5xl text-amber-600 tabular-nums leading-none dark:text-amber-400">
										{summary.outside.toLocaleString()}
									</p>
								</div>
							</div>
							<div
								className="flex h-2.5 w-full overflow-hidden bg-muted"
								role="img"
								aria-label={`${pct(summary.inside, summary.gate_scanned)}% of guests who passed a gate are inside`}
							>
								<div
									className="bg-emerald-500 transition-all"
									style={{
										width: `${pct(summary.inside, summary.gate_scanned)}%`,
									}}
								/>
								<div
									className="bg-amber-500 transition-all"
									style={{
										width: `${pct(summary.outside, summary.gate_scanned)}%`,
									}}
								/>
							</div>
							<p className="text-muted-foreground text-xs">
								{summary.gate_scanned > 0
									? `${pct(summary.inside, summary.gate_scanned)}% of the ${summary.gate_scanned.toLocaleString()} guests who passed a gate are still inside`
									: "No guest has passed a gate yet"}
							</p>
						</div>

						<div className="grid flex-1 grid-cols-2 gap-2">
							<StatTile
								label="Checked in"
								value={summary.checked_in}
								hint="Scanned at the desk"
								accent="border-l-sky-500"
							/>
							<StatTile
								label="Not checked in"
								value={summary.not_arrived}
								hint="Registered, yet to arrive"
								accent="border-l-slate-400"
							/>
							<StatTile
								label="Passed a gate"
								value={summary.gate_scanned}
								hint="Sticker read at a gate"
								accent="border-l-emerald-500"
							/>
							<StatTile
								label="Awaiting gate scan"
								value={missedTotal}
								hint={
									missedTotal > 0
										? "Checked in, no gate read. View"
										: "Checked in, no gate read"
								}
								accent="border-l-amber-500"
								onClick={
									missedTotal > 0
										? () =>
												document
													.getElementById("rfid-missed-scans")
													?.scrollIntoView({ behavior: "smooth" })
										: undefined
								}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Funnel */}
				<SectionCard
					title="Attendance funnel"
					description="From ticket sold to standing in the hall"
					className="lg:col-span-2"
				>
					<div className="space-y-4">
						<FunnelRow
							label="Registered"
							value={summary.registered}
							of={summary.registered}
							tone="bg-slate-400"
							hint="Paid, non-cancelled tickets"
						/>
						<FunnelRow
							label="Checked in at the desk"
							value={summary.checked_in}
							of={summary.registered}
							tone="bg-sky-500"
							hint={`${summary.not_arrived.toLocaleString()} registered guests have not arrived`}
						/>
						<FunnelRow
							label="Passed a gate"
							value={summary.gate_scanned}
							of={summary.registered}
							tone="bg-emerald-500"
							hint={
								missedTotal > 0
									? `${missedTotal.toLocaleString()} checked in but not yet read by a gate`
									: undefined
							}
						/>
						<FunnelRow
							label="Inside right now"
							value={summary.inside}
							of={summary.registered}
							tone="bg-emerald-700"
						/>
						<FunnelRow
							label="Outside right now"
							value={summary.outside}
							of={summary.registered}
							tone="bg-amber-500"
							hint="Entered earlier and has since left the hall"
						/>
					</div>
				</SectionCard>
			</div>

			{/* Flow */}
			<SectionCard
				title="Arrivals and movement"
				description={
					flow
						? `Entries, exits and people inside, every ${flow.interval_minutes} minutes`
						: "Entries, exits and people inside"
				}
			>
				<div className="mb-4 flex flex-wrap items-end gap-2">
					<Select
						value={flowRange.preset}
						onValueChange={(value) =>
							onFlowRangeChange({ preset: value as FlowPreset })
						}
					>
						<SelectTrigger
							className="w-44 rounded-none"
							aria-label="Chart time range"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(PRESET_LABEL) as FlowPreset[]).map((key) => (
								<SelectItem key={key} value={key}>
									{PRESET_LABEL[key]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{flowRange.preset === "custom" && (
						<>
							<Input
								type="datetime-local"
								aria-label="From"
								className="w-auto rounded-none"
								value={flowRange.from ?? ""}
								onChange={(e) =>
									onFlowRangeChange({ ...flowRange, from: e.target.value })
								}
							/>
							<span className="pb-2 text-muted-foreground text-sm">to</span>
							<Input
								type="datetime-local"
								aria-label="To"
								className="w-auto rounded-none"
								value={flowRange.to ?? ""}
								onChange={(e) =>
									onFlowRangeChange({ ...flowRange, to: e.target.value })
								}
							/>
						</>
					)}
				</div>
				{buckets.length === 0 ? (
					<div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
						No gate movement yet. The chart fills in as guests pass the gates.
					</div>
				) : (
					<ChartContainer config={flowConfig} className="h-[260px] w-full">
						<ComposedChart
							data={buckets}
							margin={{ left: -10, right: 12, top: 8, bottom: 0 }}
						>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="at"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								minTickGap={24}
								fontSize={11}
								tickFormatter={tick}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								allowDecimals={false}
								fontSize={11}
							/>
							<ChartTooltip
								content={<ChartTooltipContent labelFormatter={tick} />}
							/>
							<Bar
								dataKey="entries"
								fill="var(--color-entries)"
								radius={[2, 2, 0, 0]}
							/>
							<Bar
								dataKey="exits"
								fill="var(--color-exits)"
								radius={[2, 2, 0, 0]}
							/>
							<Line
								dataKey="inside"
								type="monotone"
								stroke="var(--color-inside)"
								strokeWidth={2}
								dot={false}
							/>
						</ComposedChart>
					</ChartContainer>
				)}
			</SectionCard>

			<div className="grid gap-4 lg:grid-cols-2">
				<SectionCard
					title="Needs attention"
					description="Things staff can act on right now"
				>
					{alerts.length === 0 ? (
						<div className="flex items-center gap-2 py-6 text-emerald-700 text-sm dark:text-emerald-400">
							<CheckCircle2 className="size-4" />
							All clear. Gates are reporting and nothing is waiting for review.
						</div>
					) : (
						<div className="space-y-2">{alerts}</div>
					)}
				</SectionCard>

				<SectionCard
					title="Sessions"
					description={`Attended = inside at least ${attendancePercent}% of the session`}
				>
					{sessions.length === 0 ? (
						<div className="flex flex-col items-start gap-3 py-4 text-muted-foreground text-sm">
							<p>
								No sessions yet. Add each talk's start and end time to see who
								attended it.
							</p>
							<Button
								size="sm"
								variant="outline"
								className="rounded-none"
								onClick={() => onNavigate("sessions")}
							>
								<Radio className="size-4" />
								Set up sessions
							</Button>
						</div>
					) : (
						<div className="space-y-2">
							{sessions.map((session) => (
								<SessionRow
									key={session.id}
									session={session}
									registered={summary.registered}
								/>
							))}
							<Button
								size="sm"
								variant="ghost"
								className="rounded-none"
								onClick={() => onNavigate("sessions")}
							>
								Manage sessions and e-certificates
							</Button>
						</div>
					)}
				</SectionCard>
			</div>

			<div id="rfid-missed-scans" className="scroll-mt-4 space-y-3">
				<div>
					<h3 className="font-semibold text-base">
						Checked in, not seen at a gate
					</h3>
					<p className="text-muted-foreground text-sm">
						Guests checked in at the desk that no gate has read yet. They may
						not have entered the hall, or the gate missed the sticker.
					</p>
				</div>
				<RfidTable
					control={{
						search: {
							placeholder: "Search name, email, phone or ticket ID...",
							enableCustomSearch: false,
							controlled: { value: searchDraft, onChange: setSearchDraft },
						},
						filters: [
							{
								label: "Reason",
								columnId: "reason",
								type: "filter",
								data: filters.map((filter) => ({
									label: filter.label,
									value: filter.value ?? "all",
								})),
								customFilter: {
									value: reason ?? "all",
									onChange: (value) => {
										onReasonChange(
											value === "all" ? undefined : (value as RfidMissedReason),
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
					columns={missedColumns}
					data={missed}
					emptyTitle="No missed scans"
					emptyDescription="Everyone checked in at the desk has been read by a gate."
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
					renderMobileCard={(ticket) => (
						<Item variant="outline" className="w-full rounded-none">
							<ItemHeader className="flex flex-col items-start gap-1">
								<ItemTitle className="font-bold text-base">
									{ticket.ticket_name}
								</ItemTitle>
								<ItemDescription className="font-mono text-xs">
									{ticket.ticket_public_id}
									{ticket.ticket_type ? ` · ${ticket.ticket_type}` : ""}
								</ItemDescription>
								<ReasonBadge reason={ticket.reason} />
							</ItemHeader>
							<ItemContent className="text-muted-foreground text-sm">
								<p>Checked in: {formatDateTime(ticket.checked_in_at)}</p>
							</ItemContent>
						</Item>
					)}
				/>
			</div>
		</div>
	);
}
