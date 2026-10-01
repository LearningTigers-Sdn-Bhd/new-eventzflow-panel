"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	getRfidSessionAttendees,
	type RfidSession,
	type RfidSessionAttendee,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { formatDuration } from "./rfid-table";

type Filter = "all" | "attended" | "partial";

const clock = (iso: string) =>
	new Date(iso).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	});

const ms = (iso: string) => new Date(iso).getTime();

// Where the guest was during the session: green blocks are time inside, the
// gaps are time away (breaks), laid on the session's own start-to-end bar.
function SessionTimeline({
	attendee,
	session,
}: {
	attendee: RfidSessionAttendee;
	session: RfidSession;
}) {
	const start = ms(session.starts_at);
	const total = ms(session.ends_at) - start;
	const left = (iso: string) => ((ms(iso) - start) / total) * 100;
	const width = (segment: RfidSessionAttendee["segments"][number]) =>
		Math.max(((ms(segment.out) - ms(segment.in)) / total) * 100, 0.4);
	const gaps = attendee.segments.slice(1).map((segment, index) => ({
		from: attendee.segments[index].out,
		to: segment.in,
	}));
	const away = Math.max(session.duration_seconds - attendee.seconds, 0);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-x-8 gap-y-2">
				<div>
					<p className="text-muted-foreground text-xs">
						Time in the hall during this session
					</p>
					<p className="font-semibold tabular-nums">
						{formatDuration(attendee.seconds)}
					</p>
					<p className="text-muted-foreground text-xs">
						All gate visits added together
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Time not in the hall</p>
					<p className="font-semibold tabular-nums">{formatDuration(away)}</p>
					<p className="text-muted-foreground text-xs">
						Late arrival, early exit or breaks
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">
						Time required to count
					</p>
					<p className="font-semibold tabular-nums">
						{formatDuration(session.required_seconds)}
					</p>
					<p className="text-muted-foreground text-xs">
						{Math.round(
							(session.required_seconds / session.duration_seconds) * 100,
						)}
						% of the session length
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Result</p>
					<p
						className={cn(
							"font-semibold",
							attendee.attended ? "text-green-700" : "text-amber-700",
						)}
					>
						{attendee.attended
							? "Counts as attended"
							: `Short by ${formatDuration(session.required_seconds - attendee.seconds)}`}
					</p>
				</div>
			</div>

			<div>
				<div className="mb-1 flex items-baseline justify-between text-xs">
					<span className="font-medium">Progress to the required time</span>
					<span className="text-muted-foreground tabular-nums">
						{formatDuration(
							Math.min(attendee.seconds, session.required_seconds),
						)}{" "}
						of {formatDuration(session.required_seconds)}
					</span>
				</div>
				<div className="h-2.5 w-full bg-muted">
					<div
						className={cn(
							"h-full",
							attendee.attended ? "bg-emerald-500" : "bg-amber-500",
						)}
						style={{
							width: `${Math.min((attendee.seconds / session.required_seconds) * 100, 100)}%`,
						}}
					/>
				</div>
			</div>

			<div>
				<p className="mb-1 font-medium text-xs">
					When they were in the hall
					<span className="ml-2 font-normal text-muted-foreground">
						(green = inside, blank = not in the hall)
					</span>
				</p>
				<div className="relative h-9 border bg-background">
					{attendee.segments.map((segment) => (
						<div
							key={`${segment.in}-${segment.out}`}
							className="absolute inset-y-1 bg-emerald-500"
							style={{
								left: `${left(segment.in)}%`,
								width: `${width(segment)}%`,
							}}
							title={`${clock(segment.in)} to ${clock(segment.out)} (${formatDuration(segment.seconds)})`}
						/>
					))}
				</div>
				<div className="mt-1 flex justify-between text-muted-foreground text-xs tabular-nums">
					<span>{clock(session.starts_at)}</span>
					<span>{clock(session.ends_at)}</span>
				</div>
			</div>

			<ol className="space-y-1.5">
				{attendee.segments.map((segment, index) => (
					<li key={`${segment.in}-${segment.out}`} className="space-y-1.5">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-l-4 border-l-emerald-500 bg-background px-3 py-2 text-sm">
							<span className="font-medium">Visit {index + 1}</span>
							<span className="tabular-nums">
								{clock(segment.in)} →{" "}
								{segment.open ? "still inside" : clock(segment.out)}
							</span>
							<Badge className="rounded-none bg-green-100 text-green-800 hover:bg-green-100">
								{formatDuration(segment.seconds)}
							</Badge>
						</div>
						{gaps[index] && (
							<div className="ml-4 flex items-center gap-2 text-muted-foreground text-xs">
								<span className="h-px w-4 border-t" />
								Away{" "}
								{formatDuration(
									Math.round(
										(ms(gaps[index].to) - ms(gaps[index].from)) / 1000,
									),
								)}{" "}
								({clock(gaps[index].from)} → {clock(gaps[index].to)})
							</div>
						)}
					</li>
				))}
			</ol>
		</div>
	);
}

function AttendeeRow({
	attendee,
	session,
	open,
	onToggle,
}: {
	attendee: RfidSessionAttendee;
	session: RfidSession;
	open: boolean;
	onToggle: () => void;
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
					<div className="font-medium">{attendee.ticket_name}</div>
					<div className="text-muted-foreground text-xs">
						{attendee.ticket_public_id}
						{attendee.ticket_type ? ` · ${attendee.ticket_type}` : ""}
					</div>
				</td>
				<td className="px-3 py-3 tabular-nums">
					{formatDuration(attendee.seconds)}
					<span
						className={cn(
							"ml-2 font-semibold",
							attendee.attended ? "text-green-700" : "text-amber-700",
						)}
					>
						{attendee.percent}%
					</span>
				</td>
				<td className="px-3 py-3">
					<Badge
						className={cn(
							"rounded-none",
							attendee.attended
								? "bg-green-100 text-green-800 hover:bg-green-100"
								: "bg-amber-100 text-amber-800 hover:bg-amber-100",
						)}
					>
						{attendee.attended ? "Attended" : "Not enough time"}
					</Badge>
				</td>
				<td className="px-3 py-3 tabular-nums">
					{attendee.visit_count}{" "}
					<span className="text-muted-foreground">
						{attendee.visit_count === 1 ? "visit" : "visits"}
					</span>
				</td>
				<td className="px-3 py-3 text-sm tabular-nums">
					{clock(attendee.first_in)}
					<span className="text-muted-foreground"> → </span>
					{attendee.still_inside ? "still inside" : clock(attendee.last_out)}
				</td>
			</tr>
			{open && (
				<tr className="bg-muted/30">
					<td />
					<td colSpan={5} className="px-3 py-4">
						<SessionTimeline attendee={attendee} session={session} />
					</td>
				</tr>
			)}
		</Fragment>
	);
}

/**
 * Full-screen check of who counted for a session. One row per guest; several
 * in/out visits are summed, and expanding a row shows each gate visit clipped
 * to the session window.
 */
export function SessionAttendeesDialog({
	eventId,
	session,
	attendancePercent,
	onClose,
}: {
	eventId: string;
	session: RfidSession | null;
	attendancePercent: number;
	onClose: () => void;
}) {
	const [filter, setFilter] = useState<Filter>("all");
	const [searchDraft, setSearchDraft] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [openId, setOpenId] = useState<number | null>(null);
	const [ticketType, setTicketType] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchDraft);
			setPage(1);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchDraft]);

	const sessionId = session?.id;
	const query = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"session-attendees",
			sessionId,
			filter,
			search,
			ticketType,
			page,
		],
		queryFn: () =>
			getRfidSessionAttendees(eventId, sessionId as number, page, 25, {
				status: filter === "all" ? undefined : filter,
				q: search,
				ticketTypeId: ticketType,
			}),
		enabled: sessionId !== undefined,
		placeholderData: (previous) => previous,
		refetchInterval: 10_000,
	});

	const counts = query.data?.counts;
	const pagination = query.data?.pagination;
	const filters: { key: Filter; label: string }[] = [
		{
			key: "all",
			label: `All (${(counts?.attended ?? 0) + (counts?.partial ?? 0)})`,
		},
		{ key: "attended", label: `Attended (${counts?.attended ?? 0})` },
		{ key: "partial", label: `Not enough time (${counts?.partial ?? 0})` },
	];

	return (
		<Dialog open={session !== null} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="flex h-[92vh] max-w-[96vw] flex-col gap-4 rounded-none sm:max-w-[96vw] lg:max-w-6xl">
				<DialogHeader>
					<DialogTitle>{session?.name} — who was inside</DialogTitle>
					<DialogDescription>
						{session
							? `${formatDateTime(session.starts_at)} to ${formatDateTime(session.ends_at)} (${formatDuration(session.duration_seconds)}). Attended = inside at least ${attendancePercent}% (${formatDuration(session.required_seconds)}). Leaving and coming back is still one row; the time is added up.`
							: ""}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-wrap items-center gap-2">
					<Input
						type="search"
						placeholder="Search name, email, phone or ticket ID"
						aria-label="Search attendees"
						className="w-full rounded-none sm:w-80"
						value={searchDraft}
						onChange={(e) => setSearchDraft(e.target.value)}
					/>
					<Select
						value={ticketType || "all"}
						onValueChange={(value) => {
							setTicketType(value === "all" ? "" : value);
							setPage(1);
						}}
					>
						<SelectTrigger
							className="w-full rounded-none sm:w-48"
							aria-label="Filter by ticket type"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All ticket types</SelectItem>
							{(query.data?.ticket_types ?? []).map((type) => (
								<SelectItem key={type.id} value={String(type.id)}>
									{type.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{filters.map((item) => (
						<Button
							key={item.key}
							size="sm"
							variant={filter === item.key ? "default" : "outline"}
							className="rounded-none"
							onClick={() => {
								setFilter(item.key);
								setPage(1);
							}}
						>
							{item.label}
						</Button>
					))}
				</div>

				<div className="min-h-0 flex-1 overflow-auto border">
					<table className="w-full text-left text-sm">
						<thead className="sticky top-0 bg-background text-muted-foreground text-xs">
							<tr>
								<th className="w-8" />
								<th className="px-3 py-2 font-medium">Guest</th>
								<th className="px-3 py-2 font-medium">Time inside</th>
								<th className="px-3 py-2 font-medium">Result</th>
								<th className="px-3 py-2 font-medium">Gate visits</th>
								<th className="px-3 py-2 font-medium">First in → last out</th>
							</tr>
						</thead>
						<tbody>
							{(query.data?.attendees ?? []).map((attendee) => (
								<AttendeeRow
									key={attendee.id}
									attendee={attendee}
									session={query.data?.session ?? (session as RfidSession)}
									open={openId === attendee.id}
									onToggle={() =>
										setOpenId(openId === attendee.id ? null : attendee.id)
									}
								/>
							))}
						</tbody>
					</table>
					{!query.isLoading && (query.data?.attendees ?? []).length === 0 && (
						<p className="p-8 text-center text-muted-foreground text-sm">
							Nobody matches. Guests appear once a gate has read them inside
							this session's time.
						</p>
					)}
				</div>

				{pagination && pagination.total_pages > 1 && (
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							Page {pagination.current_page} of {pagination.total_pages} ·{" "}
							{pagination.total_count} guests
						</span>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								className="rounded-none"
								disabled={!pagination.prev_page}
								onClick={() => setPage((p) => p - 1)}
							>
								Previous
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="rounded-none"
								disabled={!pagination.next_page}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
