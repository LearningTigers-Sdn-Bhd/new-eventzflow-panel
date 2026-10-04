"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Award,
	Check,
	Clock,
	Eye,
	Pencil,
	Plus,
	Settings2,
	ShieldCheck,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	createRfidSession,
	deleteRfidSession,
	getRfidEligibility,
	type RfidEligibilityRow,
	type RfidEligibilityStatus,
	type RfidEligibilitySummary,
	type RfidSession,
	rfidSessionSchema,
	updateRfidSession,
	updateRfidSettings,
} from "@/lib/api/rfid";
import { formatDateTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { CertOverrideDialog } from "./cert-override-dialog";
import { formatDuration, RfidTable } from "./rfid-table";
import { SessionAttendeesDialog } from "./session-attendees-dialog";
import { useServerSearch } from "./use-server-search";

// `datetime-local` carries no timezone; the backend wants RFC3339.
const toIso = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toISOString();
};
const toInput = (iso: string) => {
	const date = new Date(iso);
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
		.toISOString()
		.slice(0, 16);
};

const STATUS_META: Record<
	RfidEligibilityStatus,
	{ label: string; badge: string; hint: string }
> = {
	qualified: {
		label: "Qualified",
		badge: "bg-green-100 text-green-800 hover:bg-green-100",
		hint: "Reached the required time in every session and submitted feedback",
	},
	needs_feedback: {
		label: "Needs feedback",
		badge: "bg-amber-100 text-amber-800 hover:bg-amber-100",
		hint: "Attended, but has not submitted the evaluation form",
	},
	in_progress: {
		label: "In progress",
		badge: "bg-blue-100 text-blue-800 hover:bg-blue-100",
		hint: "A session is still to come or running",
	},
	not_qualified: {
		label: "Not qualified",
		badge: "bg-red-100 text-red-800 hover:bg-red-100",
		hint: "Missed the required time in a finished session",
	},
};
const STATUS_ORDER: RfidEligibilityStatus[] = [
	"qualified",
	"needs_feedback",
	"in_progress",
	"not_qualified",
];

function SessionDialog({
	eventId,
	session,
	open,
	onOpenChange,
}: {
	eventId: string;
	session: RfidSession | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [name, setName] = useState(session?.name ?? "");
	const [startsAt, setStartsAt] = useState(
		session ? toInput(session.starts_at) : "",
	);
	const [endsAt, setEndsAt] = useState(session ? toInput(session.ends_at) : "");
	const [mandatory, setMandatory] = useState(session?.mandatory ?? true);
	const [error, setError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: (data: {
			name: string;
			starts_at: string;
			ends_at: string;
			mandatory: boolean;
		}) =>
			session
				? updateRfidSession(eventId, session.id, data)
				: createRfidSession(eventId, data),
		onSuccess: () => {
			toast.success(session ? "Session updated." : "Session added.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			onOpenChange(false);
		},
		onError: (e) => setError(e.message),
	});

	const submit = () => {
		setError(null);
		const parsed = rfidSessionSchema.safeParse({
			name,
			starts_at: startsAt ? toIso(startsAt) : "",
			ends_at: endsAt ? toIso(endsAt) : "",
			mandatory,
		});
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? "Please check the form.");
			return;
		}
		mutation.mutate(parsed.data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{session ? "Edit session" : "Add session"}</DialogTitle>
					<DialogDescription>
						Attendance is worked out from gate movement during this window.
						Nothing is scanned per session.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="session-name">Name</Label>
						<Input
							id="session-name"
							className="rounded-none"
							placeholder="e.g. Keynote"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="session-start">Starts</Label>
							<Input
								id="session-start"
								type="datetime-local"
								className="rounded-none"
								value={startsAt}
								onChange={(e) => setStartsAt(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="session-end">Ends</Label>
							<Input
								id="session-end"
								type="datetime-local"
								className="rounded-none"
								value={endsAt}
								onChange={(e) => setEndsAt(e.target.value)}
							/>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Checkbox
							id="session-mandatory"
							checked={mandatory}
							onCheckedChange={(checked) => setMandatory(checked === true)}
						/>
						<Label htmlFor="session-mandatory" className="leading-snug">
							Counts toward the e-certificate (untick for a break or optional
							session)
						</Label>
					</div>
					{error && (
						<p role="alert" className="text-destructive text-sm">
							{error}
						</p>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						onClick={submit}
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// "2 of 3" with one square per session, and a popover naming each session so
// a long event or long session names never need their own table column.
function SessionsReached({
	row,
	required,
}: {
	row: RfidEligibilityRow;
	required: RfidSession[];
}) {
	const items = required.map((session) => {
		const result = row.sessions.find((item) => item.session_id === session.id);
		const ended = session.status === "ended";
		return {
			session,
			percent: result?.percent ?? 0,
			state: result?.met ? "met" : ended ? "missed" : "pending",
		} as const;
	});
	const met = items.filter((item) => item.state === "met").length;
	const look = {
		met: {
			box: "bg-green-100 text-green-700",
			icon: Check,
			bar: "bg-green-500",
			label: "Reached the required time",
		},
		missed: {
			box: "bg-red-100 text-red-700",
			icon: X,
			bar: "bg-red-500",
			label: "Session ended, required time not reached",
		},
		pending: {
			box: "bg-gray-100 text-gray-500",
			icon: Clock,
			bar: "bg-gray-300",
			label: "Session not finished yet",
		},
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex flex-col items-start gap-1 text-left hover:underline"
					aria-label={`${met} of ${items.length} sessions reached. Show details`}
				>
					<span className="text-sm tabular-nums">
						<span className="font-semibold">{met}</span> of {items.length}{" "}
						sessions
					</span>
					<span className="flex gap-1">
						{items.map((item) => (
							<span
								key={item.session.id}
								className={cn("size-2.5", look[item.state].bar)}
							/>
						))}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 rounded-none p-0">
				<ul className="max-h-72 divide-y overflow-auto">
					{items.map((item) => {
						const Icon = look[item.state].icon;
						return (
							<li key={item.session.id} className="space-y-1.5 px-3 py-2.5">
								<div className="flex items-start gap-2 text-sm">
									{/* same 20px line box as the text, so the icon centres on the first line */}
									<span className="flex h-5 w-4 shrink-0 items-center justify-center">
										<Icon
											className={cn(
												"size-4",
												item.state === "pending"
													? "text-gray-400"
													: cn(
															"rounded-full p-0.5 text-white",
															look[item.state].bar,
														),
											)}
											strokeWidth={item.state === "pending" ? 2 : 3}
										/>
									</span>
									<span className="min-w-0 flex-1 break-words font-medium leading-5">
										{item.session.name}
									</span>
									<span className="shrink-0 font-semibold tabular-nums leading-5">
										{item.percent}%
									</span>
								</div>
								<div className="ml-6 h-1.5 bg-muted">
									<div
										className={cn("h-full", look[item.state].bar)}
										style={{ width: `${item.percent}%` }}
									/>
								</div>
								<p className="ml-6 text-muted-foreground text-xs">
									{look[item.state].label}
								</p>
							</li>
						);
					})}
				</ul>
			</PopoverContent>
		</Popover>
	);
}

function AttendanceRuleDialog({
	eventId,
	attendancePercent,
	canUpdate,
	open,
	onOpenChange,
}: {
	eventId: string;
	attendancePercent: number;
	canUpdate: boolean;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [percent, setPercent] = useState(String(attendancePercent));
	const parsed = Number(percent);
	const valid = Number.isInteger(parsed) && parsed >= 1 && parsed <= 100;

	const mutation = useMutation({
		mutationFn: (value: number) =>
			updateRfidSettings(eventId, { attendance_percent: value }),
		onSuccess: () => {
			toast.success("Attendance rule updated.");
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
			onOpenChange(false);
		},
		onError: (e) => toast.error(e.message),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="rounded-none sm:max-w-md">
				<DialogHeader>
					<DialogTitle>How attendance is counted</DialogTitle>
					<DialogDescription>
						A guest attended a session when gate movement shows them inside for
						at least this share of its length. Several in/out visits are added
						up.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<Label htmlFor="attendance-percent">Required time inside (%)</Label>
					<Input
						id="attendance-percent"
						type="number"
						min={1}
						max={100}
						className="w-32 rounded-none"
						value={percent}
						onChange={(e) => setPercent(e.target.value)}
						disabled={!canUpdate}
					/>
					<p className="text-muted-foreground text-xs">
						Example: at {valid ? parsed : "…"}%, a 30 minute session needs{" "}
						{valid ? Math.ceil((30 * parsed) / 100) : "…"} minutes inside.
						Changing this updates past sessions too.
					</p>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						className="rounded-none"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="rounded-none"
						disabled={
							!canUpdate ||
							!valid ||
							parsed === attendancePercent ||
							mutation.isPending
						}
						onClick={() => mutation.mutate(parsed)}
					>
						{mutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function SessionsTab({
	eventId,
	sessions,
	attendancePercent,
	eligibility,
	canUpdate,
}: {
	eventId: string;
	sessions: RfidSession[];
	attendancePercent: number;
	eligibility: RfidEligibilitySummary | undefined;
	canUpdate: boolean;
}) {
	const queryClient = useQueryClient();
	const [editing, setEditing] = useState<RfidSession | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [viewing, setViewing] = useState<RfidSession | null>(null);
	const [ruleOpen, setRuleOpen] = useState(false);
	const [waiving, setWaiving] = useState<RfidEligibilityRow | null>(null);
	const [status, setStatus] = useState<RfidEligibilityStatus>();
	const [page, setPage] = useState(1);
	const [eligibilityQ, setEligibilityQ] = useState("");
	const [eligibilityType, setEligibilityType] = useState("");
	const [eligibilityPerPage, setEligibilityPerPage] = useState(25);
	const [eligibilitySearch, setEligibilitySearch] = useServerSearch(
		eligibilityQ,
		setEligibilityQ,
		() => setPage(1),
	);

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });

	const deleteMutation = useMutation({
		mutationFn: (id: number) => deleteRfidSession(eventId, id),
		onSuccess: () => {
			toast.success("Session removed.");
			invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	const eligibilityQuery = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"eligibility",
			page,
			eligibilityPerPage,
			status,
			eligibilityQ,
			eligibilityType,
		],
		queryFn: () =>
			getRfidEligibility(eventId, page, eligibilityPerPage, {
				status,
				q: eligibilityQ,
				ticketTypeId: eligibilityType,
			}),
		placeholderData: (previous) => previous,
		refetchInterval: 10_000,
		enabled: (eligibility?.required_sessions ?? 0) > 0,
	});

	const sessionColumns: ColumnDef<RfidSession, unknown>[] = [
		{
			accessorKey: "name",
			header: "Session",
			cell: ({ row }) => (
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-medium">{row.original.name}</span>
					{!row.original.mandatory && (
						<Badge className="rounded-none bg-gray-100 text-gray-800 hover:bg-gray-100">
							optional
						</Badge>
					)}
				</div>
			),
		},
		{
			accessorKey: "starts_at",
			header: "When",
			cell: ({ row }) => (
				<div className="flex flex-col text-sm">
					<span>{formatDateTime(row.original.starts_at)}</span>
					<span className="text-muted-foreground">
						{formatDuration(row.original.duration_seconds)} · ends{" "}
						{formatDateTime(row.original.ends_at)}
					</span>
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					className={cn(
						"rounded-none",
						row.original.status === "live"
							? "bg-green-100 text-green-800 hover:bg-green-100"
							: row.original.status === "upcoming"
								? "bg-blue-100 text-blue-800 hover:bg-blue-100"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
					)}
				>
					{row.original.status}
				</Badge>
			),
		},
		{
			accessorKey: "attended",
			header: `Attended (≥${attendancePercent}%)`,
			cell: ({ row }) => (
				<button
					type="button"
					className="flex flex-col items-start gap-0.5 text-left hover:underline"
					onClick={() => setViewing(row.original)}
				>
					<span>
						<span className="font-semibold">{row.original.attended}</span>
						<span className="text-muted-foreground">
							{" "}
							attended · {row.original.present - row.original.attended} not long
							enough
						</span>
					</span>
					<span className="text-muted-foreground text-xs">
						Click to view who
					</span>
				</button>
			),
		},
		{
			id: "actions",
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<ButtonGroup>
						<Button
							size="icon-sm"
							variant="outline"
							className="h-8 w-8 rounded-none p-0 text-purple-500 hover:bg-purple-50 hover:text-purple-600 [&_svg]:text-purple-500 hover:[&_svg]:text-purple-600"
							title="View who attended"
							onClick={() => setViewing(row.original)}
						>
							<Eye className="size-4" />
						</Button>
						{canUpdate && (
							<>
								<Button
									size="icon-sm"
									variant="outline"
									className="h-8 w-8 rounded-none p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
									title="Edit Session"
									onClick={() => {
										setEditing(row.original);
										setDialogOpen(true);
									}}
								>
									<Pencil className="size-4" />
								</Button>
								<Button
									size="icon-sm"
									variant="outline"
									className="h-8 w-8 rounded-none p-0 text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
									title="Delete Session"
									onClick={() => {
										if (
											window.confirm(`Delete session "${row.original.name}"?`)
										) {
											deleteMutation.mutate(row.original.id);
										}
									}}
								>
									<Trash2 className="size-4" />
								</Button>
							</>
						)}
					</ButtonGroup>
				</div>
			),
		},
	];

	const required = eligibilityQuery.data?.sessions ?? [];
	const eligibilityColumns: ColumnDef<RfidEligibilityRow, unknown>[] = [
		{
			accessorKey: "ticket_name",
			header: "Guest",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1">
					<span className="font-medium">{row.original.ticket_name}</span>
					<span className="text-muted-foreground text-sm">
						{row.original.ticket_public_id}
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
			id: "sessions",
			header: "Sessions reached",
			cell: ({ row }) => (
				<SessionsReached row={row.original} required={required} />
			),
		},
		{
			accessorKey: "feedback_submitted",
			header: "Evaluation form",
			cell: ({ row }) => (row.original.feedback_submitted ? "Submitted" : "—"),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<div className="flex flex-wrap items-center gap-1.5">
					<Badge
						className={cn(
							"rounded-none",
							STATUS_META[row.original.status].badge,
						)}
					>
						{STATUS_META[row.original.status].label}
					</Badge>
					{row.original.override && (
						<Badge
							variant="outline"
							className="rounded-none"
							title={row.original.override.reason}
						>
							Waived
						</Badge>
					)}
				</div>
			),
		},
		...(canUpdate
			? [
					{
						id: "actions",
						header: () => <div className="text-center">Actions</div>,
						cell: ({ row }) => (
							<div className="flex justify-center">
								<Button
									size="icon-sm"
									variant="outline"
									className="h-8 w-8 rounded-none p-0 text-green-600 hover:bg-green-50 hover:text-green-700 [&_svg]:text-green-600 hover:[&_svg]:text-green-700"
									title="Waive attendance"
									onClick={() => setWaiving(row.original)}
								>
									<ShieldCheck className="size-4" />
								</Button>
							</div>
						),
					} satisfies ColumnDef<RfidEligibilityRow, unknown>,
				]
			: []),
	];

	const eligibilityPagination = eligibilityQuery.data?.pagination;

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h3 className="font-semibold text-base">Sessions</h3>
						<p className="text-muted-foreground text-sm">
							Add each talk's start and end time. Guests must reach the required
							time in every session to earn the e-certificate.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							className="rounded-none"
							onClick={() => setRuleOpen(true)}
						>
							<Settings2 className="size-4" />
							Attendance rule ({attendancePercent}%)
						</Button>
						{canUpdate && (
							<Button
								className="rounded-none"
								onClick={() => {
									setEditing(null);
									setDialogOpen(true);
								}}
							>
								<Plus className="size-4" />
								Add session
							</Button>
						)}
					</div>
				</div>
				<RfidTable
					columns={sessionColumns}
					data={sessions}
					emptyTitle="No sessions yet"
					emptyDescription="Add a session to see who attended it."
					renderMobileCard={(session) => (
						<div className="space-y-2 border p-3">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-bold">{session.name}</span>
								{!session.mandatory && (
									<Badge className="rounded-none bg-gray-100 text-gray-800 hover:bg-gray-100">
										optional
									</Badge>
								)}
								<Badge className="rounded-none" variant="outline">
									{session.status}
								</Badge>
							</div>
							<p className="text-muted-foreground text-sm">
								{formatDateTime(session.starts_at)} →{" "}
								{formatDateTime(session.ends_at)}
							</p>
							<p className="text-sm">
								<span className="font-semibold">{session.attended}</span>{" "}
								attended · {session.present - session.attended} not long enough
							</p>
							<Button
								size="sm"
								variant="outline"
								className="rounded-none"
								onClick={() => setViewing(session)}
							>
								View who attended
							</Button>
							{canUpdate && (
								<div className="flex gap-2">
									<Button
										size="sm"
										variant="outline"
										className="rounded-none"
										onClick={() => {
											setEditing(session);
											setDialogOpen(true);
										}}
									>
										<Pencil className="size-4" />
										Edit
									</Button>
									<Button
										size="sm"
										variant="outline"
										className="rounded-none"
										onClick={() => {
											if (window.confirm(`Delete session "${session.name}"?`)) {
												deleteMutation.mutate(session.id);
											}
										}}
									>
										<Trash2 className="size-4" />
										Delete
									</Button>
								</div>
							)}
						</div>
					)}
				/>
			</div>

			<div className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h3 className="font-semibold text-base">
							E-certificate eligibility
						</h3>
						<p className="text-muted-foreground text-sm">
							Qualified = attended every session for at least{" "}
							{attendancePercent}% of its time and submitted the evaluation
							form. Staff can waive the attendance rule for a guest who had to
							leave.
						</p>
					</div>
					<Button asChild variant="outline" className="rounded-none">
						<Link href={`/event/${eventId}/certificates`}>
							<Award className="size-4" />
							Send e-certificates
						</Link>
					</Button>
				</div>

				{(eligibility?.required_sessions ?? 0) === 0 ? (
					<div className="border p-6 text-muted-foreground text-sm">
						Add a session to see who is eligible.
					</div>
				) : (
					<>
						<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
							{STATUS_ORDER.map((key) => (
								<button
									key={key}
									type="button"
									onClick={() => {
										setStatus(status === key ? undefined : key);
										setPage(1);
									}}
									className={cn(
										"border p-3 text-left transition-colors hover:bg-accent",
										status === key && "border-primary bg-primary/5",
									)}
								>
									<p className="text-muted-foreground text-xs">
										{STATUS_META[key].label}
									</p>
									<p className="font-bold text-2xl tabular-nums">
										{eligibility?.[key] ?? 0}
									</p>
									<p className="text-muted-foreground text-xs">
										{STATUS_META[key].hint}
									</p>
								</button>
							))}
						</div>
						<RfidTable
							control={{
								search: {
									placeholder: "Search name, email, phone or ticket ID...",
									enableCustomSearch: false,
									controlled: {
										value: eligibilitySearch,
										onChange: setEligibilitySearch,
									},
								},
								filters: [
									{
										label: "Status",
										columnId: "status",
										type: "filter",
										data: [
											{ label: "All", value: "all" },
											...STATUS_ORDER.map((key) => ({
												label: STATUS_META[key].label,
												value: key,
											})),
										],
										customFilter: {
											value: status ?? "all",
											onChange: (value) => {
												setStatus(
													value === "all"
														? undefined
														: (value as RfidEligibilityStatus),
												);
												setPage(1);
											},
										},
									},
									{
										label: "Ticket Type",
										columnId: "ticketType",
										type: "filter",
										data: [
											{ label: "All", value: "all" },
											...(eligibilityQuery.data?.ticket_types ?? []).map(
												(type) => ({
													label: type.name,
													value: String(type.id),
												}),
											),
										],
										customFilter: {
											value: eligibilityType || "all",
											onChange: (value) => {
												setEligibilityType(value === "all" ? "" : value);
												setPage(1);
											},
										},
									},
								],
							}}
							columns={eligibilityColumns}
							data={eligibilityQuery.data?.tickets ?? []}
							emptyTitle="No guests in this group"
							emptyDescription="Pick another status above."
							pagination={
								eligibilityPagination
									? {
											pageIndex: page - 1,
											pageSize: eligibilityPagination.per_page,
											pageCount: eligibilityPagination.total_pages,
											totalCount: eligibilityPagination.total_count,
											onPageChange: (pageIndex) => setPage(pageIndex + 1),
											onPageSizeChange: (size) => {
												setEligibilityPerPage(size);
												setPage(1);
											},
										}
									: undefined
							}
							renderMobileCard={(row) => (
								<div className="space-y-1 border p-3">
									<div className="flex items-center justify-between gap-2">
										<span className="font-bold">{row.ticket_name}</span>
										<Badge
											className={cn(
												"rounded-none",
												STATUS_META[row.status].badge,
											)}
										>
											{STATUS_META[row.status].label}
										</Badge>
									</div>
									<p className="font-mono text-muted-foreground text-xs">
										{row.ticket_public_id}
									</p>
									<SessionsReached row={row} required={required} />
									<p className="text-muted-foreground text-sm">
										Evaluation form:{" "}
										{row.feedback_submitted ? "submitted" : "not yet"}
									</p>
									{canUpdate && (
										<Button
											size="sm"
											variant="outline"
											className="rounded-none"
											onClick={() => setWaiving(row)}
										>
											<ShieldCheck className="size-4" />
											{row.override ? "Waived" : "Waive attendance"}
										</Button>
									)}
								</div>
							)}
						/>
					</>
				)}
			</div>

			<AttendanceRuleDialog
				key={`${ruleOpen}-${attendancePercent}`}
				eventId={eventId}
				attendancePercent={attendancePercent}
				canUpdate={canUpdate}
				open={ruleOpen}
				onOpenChange={setRuleOpen}
			/>

			<CertOverrideDialog
				key={`waive-${waiving?.id ?? "none"}`}
				eventId={eventId}
				row={waiving}
				onClose={() => setWaiving(null)}
			/>

			<SessionAttendeesDialog
				key={viewing?.id ?? "none"}
				eventId={eventId}
				session={viewing}
				attendancePercent={attendancePercent}
				onClose={() => setViewing(null)}
			/>

			{dialogOpen && (
				<SessionDialog
					key={editing?.id ?? "new"}
					eventId={eventId}
					session={editing}
					open={dialogOpen}
					onOpenChange={setDialogOpen}
				/>
			)}
		</div>
	);
}
