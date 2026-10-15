"use client";

import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Table2 } from "lucide-react";
import { use, useMemo, useState } from "react";
import { CustomDashboardView } from "@/components/pages/analytics/custom-dashboard-view";
import {
	CustomFieldBreakdownCard,
	type CustomFieldBreakdownChange,
	humanizeFieldKey,
} from "@/components/pages/analytics/custom-field-breakdown-card";
import { TicketTypeBreakdownCard } from "@/components/pages/analytics/ticket-type-breakdown-card";
import {
	ExportPdfButton,
	prepareCustomReportData,
} from "@/components/pdf-reports";
import { Button } from "@/components/ui/button";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { useReportLanguage } from "@/hooks/use-report-language";
import { getEventById } from "@/lib/api/event";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";
import { cn } from "@/lib/utils";

interface CustomReportsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

function ReportLanguageToggle() {
	const { language, setLanguage } = useReportLanguage();

	return (
		<div className="flex border">
			{(["en", "bm"] as const).map((lang) => (
				<Button
					key={lang}
					type="button"
					variant="ghost"
					className={cn(
						"rounded-none border-0 px-4",
						language === lang && "bg-secondary",
					)}
					onClick={() => setLanguage(lang)}
				>
					{lang === "en" ? "English" : "Bahasa Melayu"}
				</Button>
			))}
		</div>
	);
}

export default function CustomReportsPage({ params }: CustomReportsPageProps) {
	const { event_id } = use(params);
	const { language, labels } = useReportLanguage();

	const { data: event, isLoading: eventLoading } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
	});

	const [ticketTypeRows, setTicketTypeRows] = useState<
		CustomFieldBreakdownRow[] | null
	>(null);
	const [ticketTypeLoading, setTicketTypeLoading] = useState(true);
	const [customField, setCustomField] =
		useState<CustomFieldBreakdownChange>(null);
	const [customFieldLoading, setCustomFieldLoading] = useState(false);

	// Table vs chart dashboard; persisted per event. The selector cards stay
	// mounted in both views (custom field card renders selectors-only in
	// dashboard view) so the same "show count / split by" selections drive
	// both the tables and the charts without extra state plumbing.
	const [view, setView] = usePersistedState<"table" | "dashboard">(
		`event-${event_id}-custom-reports-view`,
		"table",
	);

	const reportData = useMemo(() => {
		if (!event) return null;
		return prepareCustomReportData(
			{
				id: event_id,
				name: event.title,
				start_date: event.start_date,
				end_date: event.end_date,
			},
			{
				ticketTypeBreakdown: ticketTypeRows?.length
					? { label: labels.ticketType, rows: ticketTypeRows }
					: undefined,
				customFieldBreakdown: customField
					? "groupBy" in customField
						? {
								fieldLabel: humanizeFieldKey(customField.fieldKey),
								groupLabel: humanizeFieldKey(customField.groupBy),
								groups: customField.groups,
							}
						: {
								label: humanizeFieldKey(customField.fieldKey),
								rows: customField.rows,
							}
					: undefined,
			},
			language,
		);
	}, [event, event_id, ticketTypeRows, customField, language, labels]);

	return (
		<div className="space-y-4">
			<div className="flex justify-end gap-2">
				<div className="flex border">
					<Button
						type="button"
						variant="ghost"
						className={cn(
							"rounded-none border-0 px-4",
							view === "table" && "bg-secondary",
						)}
						onClick={() => setView("table")}
					>
						<Table2 className="mr-1 h-4 w-4" />
						{labels.tableView}
					</Button>
					<Button
						type="button"
						variant="ghost"
						className={cn(
							"rounded-none border-0 px-4",
							view === "dashboard" && "bg-secondary",
						)}
						onClick={() => setView("dashboard")}
					>
						<LayoutDashboard className="mr-1 h-4 w-4" />
						{labels.dashboardView}
					</Button>
				</div>
				<ReportLanguageToggle />
				<ExportPdfButton data={reportData} disabled={eventLoading} />
			</div>

			{/* Selector cards stay mounted in both views so the "show count /
			split by" selections keep feeding the dashboard charts. In dashboard
			view the custom field card collapses to just its selectors. */}
			<div className="space-y-4">
				{view === "table" && (
					<TicketTypeBreakdownCard
						eventId={event_id}
						onDataChange={setTicketTypeRows}
						onLoadingChange={setTicketTypeLoading}
					/>
				)}
				{/* In dashboard view the ticket breakdown still needs fetching —
				mount the card invisibly rather than duplicating the query. */}
				{view === "dashboard" && (
					<div className="hidden">
						<TicketTypeBreakdownCard
							eventId={event_id}
							onDataChange={setTicketTypeRows}
							onLoadingChange={setTicketTypeLoading}
						/>
					</div>
				)}
				<CustomFieldBreakdownCard
					eventId={event_id}
					onDataChange={setCustomField}
					onLoadingChange={setCustomFieldLoading}
					selectorsOnly={view === "dashboard"}
				/>
			</div>

			{view === "dashboard" && (
				<CustomDashboardView
					eventId={event_id}
					ticketTypeRows={ticketTypeRows}
					ticketTypeLoading={ticketTypeLoading}
					customField={customField}
					customFieldLoading={customFieldLoading}
				/>
			)}
		</div>
	);
}
