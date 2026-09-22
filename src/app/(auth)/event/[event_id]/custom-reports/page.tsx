"use client";

import { useQuery } from "@tanstack/react-query";
import { use, useMemo, useState } from "react";
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
	const [customField, setCustomField] =
		useState<CustomFieldBreakdownChange>(null);

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
				<ReportLanguageToggle />
				<ExportPdfButton data={reportData} disabled={eventLoading} />
			</div>
			<TicketTypeBreakdownCard
				eventId={event_id}
				onDataChange={setTicketTypeRows}
			/>
			<CustomFieldBreakdownCard
				eventId={event_id}
				onDataChange={setCustomField}
			/>
		</div>
	);
}
