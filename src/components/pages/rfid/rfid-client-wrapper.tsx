"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	Download,
	ListChecks,
	Radio,
	Settings2,
	Users,
	Waves,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatsCard } from "@/components/admin-ui/analytic/stats-card";
import { useEventSidebarContext } from "@/components/sidebars/features/events/event-sidebar-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import {
	downloadRfidVisitsCsv,
	getRfidAnomalies,
	getRfidVisits,
	type RfidBinding,
	type RfidStation,
	type RfidSummary,
} from "@/lib/api/rfid";
import { restClient } from "@/utils/rest-api";
import { AnomaliesTab } from "./anomalies-tab";
import { BindingsTab } from "./bindings-tab";
import { SettingsTab } from "./settings-tab";
import { StationsTab } from "./stations-tab";
import { VisitsTab } from "./visits-tab";

interface RfidClientWrapperProps {
	eventId: string;
	summary: RfidSummary;
	stations: RfidStation[];
	bindings: RfidBinding[];
}

export function RfidClientWrapper({
	eventId,
	summary,
	stations,
	bindings,
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

	const [visitsPage, setVisitsPage] = useState(1);
	const [anomaliesPage, setAnomaliesPage] = useState(1);

	const visitsQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "visits", visitsPage],
		queryFn: () => getRfidVisits(eventId, visitsPage, 25),
		placeholderData: (previous) => previous,
	});
	const anomaliesQuery = useQuery({
		queryKey: ["event", eventId, "rfid", "anomalies", anomaliesPage],
		queryFn: () => getRfidAnomalies(eventId, anomaliesPage, 25),
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
			}>(`v1/events/${eventId}`);
			return {
				event_id: event.id,
				rfid_mode: event.rfid_mode ?? ("bind" as const),
				require_check_in: event.rfid_require_check_in ?? false,
			};
		},
	});

	const csvMutation = useMutation({
		mutationFn: () => downloadRfidVisitsCsv(eventId),
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `rfid-visits-event-${eventId}.csv`;
			link.click();
			URL.revokeObjectURL(url);
			queryClient.invalidateQueries({ queryKey: ["event", eventId, "rfid"] });
		},
		onError: (error) => toast.error(error.message),
	});

	useSetEventActions(
		<Button
			variant="outline"
			onClick={() => csvMutation.mutate()}
			disabled={csvMutation.isPending}
			className="w-full shrink-0 rounded-none lg:w-auto"
		>
			<Download className="mr-2 size-4" />
			{csvMutation.isPending ? "Exporting..." : "Export visits CSV"}
		</Button>,
	);

	return (
		<div className="p-0">
			{/* Summary stats — same StatsCard grid used across dashboards */}
			<div className="grid grid-cols-2 gap-1.5 sm:gap-2 xl:grid-cols-4">
				<StatsCard
					label="Headcount"
					value={summary.headcount}
					subtitle="People inside right now"
					Icon={Users}
				/>
				<StatsCard
					label="Open visits"
					value={summary.open_visits}
					subtitle="Entries without an exit yet"
					Icon={Waves}
				/>
				<StatsCard
					label="Anomalies"
					value={summary.anomaly_count}
					subtitle="Readings needing review"
					Icon={AlertTriangle}
					variant={summary.anomaly_count > 0 ? "yellow" : "default"}
				/>
				<StatsCard
					label="Last observed"
					value={
						summary.last_observed_at
							? new Date(summary.last_observed_at).toLocaleTimeString("en-US", {
									hour: "numeric",
									minute: "2-digit",
									hour12: true,
								})
							: "—"
					}
					subtitle={
						summary.last_observed_at
							? new Date(summary.last_observed_at).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})
							: "No gate readings yet"
					}
					Icon={ListChecks}
				/>
			</div>

			<Tabs defaultValue="stations" className="mt-6 w-full">
				<div className="w-full overflow-x-auto border-y border-dashed">
					<TabsList className="flex h-12 w-full rounded-none">
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
						<TabsTrigger
							value="settings"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Settings2 className="size-4" />
							Settings
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="mt-6">
					<TabsContent value="stations" className="mt-0">
						<StationsTab
							eventId={eventId}
							stations={stations}
							canUpdate={canUpdate}
						/>
					</TabsContent>

					<TabsContent value="bindings" className="mt-0">
						<BindingsTab bindings={bindings} />
					</TabsContent>

					<TabsContent value="visits" className="mt-0">
						<VisitsTab
							eventId={eventId}
							visits={visitsQuery.data?.visits ?? []}
							pagination={visitsQuery.data?.pagination}
							page={visitsPage}
							onPageChange={setVisitsPage}
							canUpdate={canUpdate}
						/>
					</TabsContent>

					<TabsContent value="anomalies" className="mt-0">
						<AnomaliesTab
							observations={anomaliesQuery.data?.observations ?? []}
							visits={anomaliesQuery.data?.visits ?? []}
							pagination={anomaliesQuery.data?.pagination}
							page={anomaliesPage}
							onPageChange={setAnomaliesPage}
						/>
					</TabsContent>

					<TabsContent value="settings" className="mt-0">
						{settingsQuery.data ? (
							<SettingsTab
								eventId={eventId}
								settings={settingsQuery.data}
								canUpdate={canUpdate}
							/>
						) : (
							<div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
								Loading settings...
							</div>
						)}
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
