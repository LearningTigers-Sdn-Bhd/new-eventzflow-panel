"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	CalendarClock,
	Download,
	LayoutDashboard,
	ListChecks,
	Monitor,
	Radio,
	Settings2,
	Users,
} from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import {
	downloadRfidReportXlsx,
	getRfidAnomalies,
	getRfidBindings,
	getRfidFlow,
	getRfidGuestVisits,
	getRfidMissedScans,
	getRfidSessions,
	type RfidMissedReason,
	type RfidStation,
	type RfidSummary,
} from "@/lib/api/rfid";
import { restClient } from "@/utils/rest-api";
import { AnomaliesTab } from "./anomalies-tab";
import { BindingsTab } from "./bindings-tab";
import {
	DashboardTab,
	type FlowRange,
	RFID_TABS,
	type RfidTabName,
	resolveFlowRange,
} from "./dashboard-tab";
import { SessionsTab } from "./sessions-tab";
import { SettingsDialog } from "./settings-tab";
import { StationsTab } from "./stations-tab";
import { VisitsTab } from "./visits-tab";

interface RfidClientWrapperProps {
	eventId: string;
	summary: RfidSummary;
	summaryTicketType: string;
	onSummaryTicketTypeChange: (value: string) => void;
	stations: RfidStation[];
}

export function RfidClientWrapper({
	eventId,
	summary,
	summaryTicketType,
	onSummaryTicketTypeChange,
	stations,
}: RfidClientWrapperProps) {
	const queryClient = useQueryClient();
	const { permissions } = useEventSidebarContext();
	// Mirrors EventPolicy#update? (settings, station corrections, manual
	// exits): org owner, organizer, event admin or event team member. The
	// backend enforces regardless; this only hides the controls.
	const canUpdate =
		permissions.isOrgOwner ||
		permissions.isOrganizer ||
		permissions.isEventAdmin ||
		permissions.isEventTeamMember;

	// Mirrors EventPolicy#rfid_admin? (delete / edit / clear): org owner only.
	const canAdmin = permissions.isOrgOwner === true;

	const [visitsPage, setVisitsPage] = useState(1);
	const [anomaliesPage, setAnomaliesPage] = useState(1);
	const [anomaliesPerPage, setAnomaliesPerPage] = useState(25);
	const [anomaliesSearch, setAnomaliesSearch] = useState("");
	const [anomaliesOutcome, setAnomaliesOutcome] = useState("");
	const [anomaliesStation, setAnomaliesStation] = useState("");
	const [visitsPerPage, setVisitsPerPage] = useState(25);
	const [visitsType, setVisitsType] = useState("");
	const [missedPage, setMissedPage] = useState(1);
	const [missedReason, setMissedReason] = useState<RfidMissedReason>();
	const [bindingsPage, setBindingsPage] = useState(1);
	const [bindingsPerPage, setBindingsPerPage] = useState(25);
	const [bindingsStatus, setBindingsStatus] = useState<"active" | "revoked">();
	const [bindingsSearch, setBindingsSearch] = useState("");
	const [bindingsType, setBindingsType] = useState("");
	const [visitsStatus, setVisitsStatus] = useState<"inside" | "outside">();
	const [visitsSearch, setVisitsSearch] = useState("");
	const [missedPerPage, setMissedPerPage] = useState(25);
	const [missedSearch, setMissedSearch] = useState("");
	const [missedType, setMissedType] = useState("");
	const [flowRange, setFlowRange] = useState<FlowRange>({ preset: "all" });
	// Kept in the URL (?tab=sessions) so a refresh or a shared link lands on the
	// same tab.
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [tab, setTab] = useQueryState(
		"tab",
		parseAsStringLiteral(RFID_TABS).withDefault("dashboard"),
	);

	// Gate activity is live: refresh every 10s while the tab is visible.
	const LIVE_MS = 10_000;

	const visitsQuery = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"visits",
			visitsPage,
			visitsPerPage,
			visitsStatus,
			visitsSearch,
			visitsType,
		],
		queryFn: () =>
			getRfidGuestVisits(eventId, visitsPage, visitsPerPage, {
				status: visitsStatus,
				q: visitsSearch,
				ticketTypeId: visitsType,
			}),
		placeholderData: (previous) => previous,
		refetchInterval: LIVE_MS,
	});
	const bindingsQuery = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"bindings",
			bindingsPage,
			bindingsPerPage,
			bindingsStatus,
			bindingsSearch,
			bindingsType,
		],
		queryFn: () =>
			getRfidBindings(eventId, bindingsPage, bindingsPerPage, {
				status: bindingsStatus,
				q: bindingsSearch,
				ticketTypeId: bindingsType,
			}),
		placeholderData: (previous) => previous,
	});
	const flowQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "flow", flowRange],
		queryFn: () => getRfidFlow(eventId, resolveFlowRange(flowRange)),
		placeholderData: (previous) => previous,
		refetchInterval: LIVE_MS,
	});
	const sessionsQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "sessions"],
		queryFn: () => getRfidSessions(eventId),
		refetchInterval: LIVE_MS,
	});
	const missedQuery = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"missed",
			missedPage,
			missedPerPage,
			missedReason,
			missedSearch,
			missedType,
		],
		queryFn: () =>
			getRfidMissedScans(eventId, missedPage, missedPerPage, {
				reason: missedReason,
				q: missedSearch,
				ticketTypeId: missedType,
			}),
		placeholderData: (previous) => previous,
		refetchInterval: LIVE_MS,
	});
	const anomaliesQuery = useQuery({
		queryKey: [
			"event",
			eventId,
			"rfid",
			"anomalies",
			anomaliesPage,
			anomaliesPerPage,
			anomaliesSearch,
			anomaliesOutcome,
			anomaliesStation,
		],
		queryFn: () =>
			getRfidAnomalies(eventId, anomaliesPage, anomaliesPerPage, {
				q: anomaliesSearch,
				outcome: anomaliesOutcome,
				station: anomaliesStation,
			}),
		placeholderData: (previous) => previous,
	});
	// There is no GET settings endpoint; the event record carries the two
	// RFID columns (rfid_mode / rfid_require_check_in) and PATCH /settings
	// returns the authoritative payload after a save.
	const settingsQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "settings"],
		queryFn: async () => {
			const event = await restClient.get<{
				id: number;
				rfid_mode?: "bind" | "write";
				rfid_require_check_in?: boolean;
				rfid_attendance_percent?: number;
			}>(`v1/events/${eventId}`);
			return {
				event_id: event.id,
				rfid_mode: event.rfid_mode ?? ("bind" as const),
				require_check_in: event.rfid_require_check_in ?? false,
				attendance_percent: event.rfid_attendance_percent ?? 80,
			};
		},
	});

	const reportMutation = useMutation({
		mutationFn: () => downloadRfidReportXlsx(eventId),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `rfid-report-event-${eventId}.xlsx`;
			link.click();
			URL.revokeObjectURL(url);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
		},
		onError: (error) => toast.error(error.message),
	});

	useSetEventActions(
		<div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
			<Button
				variant="outline"
				asChild
				className="w-full shrink-0 rounded-none lg:w-auto"
			>
				<a
					href={`/event/${eventId}/rfid/display`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Monitor className="mr-2 size-4" />
					Open gate display
				</a>
			</Button>
			<Button
				variant="outline"
				onClick={() => setSettingsOpen(true)}
				disabled={!settingsQuery.data}
				className="w-full shrink-0 rounded-none lg:w-auto"
			>
				<Settings2 className="mr-2 size-4" />
				Settings
			</Button>
			<Button
				variant="outline"
				onClick={() => reportMutation.mutate()}
				disabled={reportMutation.isPending}
				className="w-full shrink-0 rounded-none lg:w-auto"
			>
				<Download className="mr-2 size-4" />
				{reportMutation.isPending
					? "Preparing report..."
					: "Download report (Excel)"}
			</Button>
		</div>,
	);

	return (
		<div className="p-0">
			<Tabs
				value={tab}
				onValueChange={(value) => setTab(value as RfidTabName)}
				className="w-full"
			>
				<div className="w-full overflow-x-auto border-y border-dashed">
					<TabsList className="flex h-12 w-full rounded-none">
						<TabsTrigger
							value="dashboard"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<LayoutDashboard className="size-4" />
							Dashboard
						</TabsTrigger>
						<TabsTrigger
							value="sessions"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<CalendarClock className="size-4" />
							Sessions
						</TabsTrigger>
						<TabsTrigger
							value="stations"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Radio className="size-4" />
							Stations
						</TabsTrigger>
						<TabsTrigger
							value="bindings"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<ListChecks className="size-4" />
							Bindings
						</TabsTrigger>
						<TabsTrigger
							value="visits"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Users className="size-4" />
							Visits
						</TabsTrigger>
						<TabsTrigger
							value="anomalies"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<AlertTriangle className="size-4" />
							Anomalies
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="mt-6">
					<TabsContent value="dashboard" className="mt-0">
						<DashboardTab
							eventId={eventId}
							canUpdate={canUpdate}
							summary={summary}
							summaryTicketType={summaryTicketType}
							onSummaryTicketTypeChange={onSummaryTicketTypeChange}
							flow={flowQuery.data}
							flowRange={flowRange}
							onFlowRangeChange={setFlowRange}
							sessions={sessionsQuery.data?.sessions ?? []}
							attendancePercent={sessionsQuery.data?.attendance_percent ?? 80}
							stations={stations}
							missed={missedQuery.data?.tickets ?? []}
							pagination={missedQuery.data?.pagination}
							page={missedPage}
							onPageChange={setMissedPage}
							ticketTypes={missedQuery.data?.ticket_types ?? []}
							search={missedSearch}
							onSearchChange={setMissedSearch}
							ticketType={missedType}
							onTicketTypeChange={setMissedType}
							reason={missedReason}
							onReasonChange={setMissedReason}
							onPerPageChange={setMissedPerPage}
							onNavigate={setTab}
						/>
					</TabsContent>

					<TabsContent value="sessions" className="mt-0">
						<SessionsTab
							eventId={eventId}
							sessions={sessionsQuery.data?.sessions ?? []}
							attendancePercent={sessionsQuery.data?.attendance_percent ?? 80}
							eligibility={sessionsQuery.data?.eligibility}
							canUpdate={canUpdate}
						/>
					</TabsContent>

					<TabsContent value="stations" className="mt-0">
						<StationsTab
							eventId={eventId}
							stations={stations}
							canUpdate={canUpdate}
							canAdmin={canAdmin}
						/>
					</TabsContent>

					<TabsContent value="bindings" className="mt-0">
						<BindingsTab
							eventId={eventId}
							bindings={bindingsQuery.data?.bindings ?? []}
							ticketTypes={bindingsQuery.data?.ticket_types ?? []}
							pagination={bindingsQuery.data?.pagination}
							page={bindingsPage}
							onPageChange={setBindingsPage}
							onPerPageChange={setBindingsPerPage}
							status={bindingsStatus}
							onStatusChange={setBindingsStatus}
							search={bindingsSearch}
							onSearchChange={setBindingsSearch}
							ticketType={bindingsType}
							onTicketTypeChange={setBindingsType}
							canAdmin={canAdmin}
						/>
					</TabsContent>

					<TabsContent value="visits" className="mt-0">
						<VisitsTab
							eventId={eventId}
							guests={visitsQuery.data?.guests ?? []}
							ticketTypes={visitsQuery.data?.ticket_types ?? []}
							ticketType={visitsType}
							onTicketTypeChange={setVisitsType}
							onPerPageChange={setVisitsPerPage}
							pagination={visitsQuery.data?.pagination}
							page={visitsPage}
							onPageChange={setVisitsPage}
							status={visitsStatus}
							onStatusChange={setVisitsStatus}
							search={visitsSearch}
							onSearchChange={setVisitsSearch}
							canUpdate={canUpdate}
							canAdmin={canAdmin}
						/>
					</TabsContent>

					<TabsContent value="anomalies" className="mt-0">
						<AnomaliesTab
							eventId={eventId}
							canAdmin={canAdmin}
							observations={anomaliesQuery.data?.observations ?? []}
							visits={anomaliesQuery.data?.visits ?? []}
							pagination={anomaliesQuery.data?.pagination}
							page={anomaliesPage}
							onPageChange={setAnomaliesPage}
							onPerPageChange={setAnomaliesPerPage}
							stations={anomaliesQuery.data?.stations ?? []}
							search={anomaliesSearch}
							onSearchChange={setAnomaliesSearch}
							outcome={anomaliesOutcome}
							onOutcomeChange={setAnomaliesOutcome}
							station={anomaliesStation}
							onStationChange={setAnomaliesStation}
						/>
					</TabsContent>
				</div>
			</Tabs>
			{settingsOpen && settingsQuery.data && (
				<SettingsDialog
					eventId={eventId}
					settings={settingsQuery.data}
					canUpdate={canUpdate}
					open={settingsOpen}
					onOpenChange={setSettingsOpen}
				/>
			)}
		</div>
	);
}
