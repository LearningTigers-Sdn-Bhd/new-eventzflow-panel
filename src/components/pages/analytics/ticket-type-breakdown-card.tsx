"use client";

import { useQuery } from "@tanstack/react-query";
import { Ticket } from "lucide-react";
import { useEffect } from "react";
import { useReportLanguage } from "@/hooks/use-report-language";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";
import { getTicketTypeBreakdown } from "@/lib/api/event/analytics";
import { BreakdownTable } from "./breakdown-table";
import { ReportSection } from "./report-section";

interface TicketTypeBreakdownCardProps {
	eventId: string;
	onDataChange?: (rows: CustomFieldBreakdownRow[] | null) => void;
	onLoadingChange?: (isLoading: boolean) => void;
}

/** Count-only breakdown of tickets grouped by ticket type. */
export function TicketTypeBreakdownCard({
	eventId,
	onDataChange,
	onLoadingChange,
}: TicketTypeBreakdownCardProps) {
	const { labels } = useReportLanguage();
	const { data, isLoading } = useQuery({
		queryKey: ["event", eventId, "ticket_type_breakdown"],
		queryFn: () => getTicketTypeBreakdown(eventId),
	});

	useEffect(() => {
		onDataChange?.(data?.data ?? null);
	}, [data, onDataChange]);

	useEffect(() => {
		onLoadingChange?.(isLoading);
	}, [isLoading, onLoadingChange]);

	return (
		<ReportSection icon={Ticket} title={labels.ticketTypeBreakdown}>
			<BreakdownTable
				labelHeader={labels.ticketType}
				rows={data?.data}
				isLoading={isLoading}
			/>
		</ReportSection>
	);
}
