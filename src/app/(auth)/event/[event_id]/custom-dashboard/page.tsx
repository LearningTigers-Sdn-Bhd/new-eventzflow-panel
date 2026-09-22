"use client";

import { useQuery } from "@tanstack/react-query";
import { Table2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { use, useState } from "react";
import { CustomDashboardView } from "@/components/pages/analytics/custom-dashboard-view";
import {
	CustomFieldBreakdownCard,
	type CustomFieldBreakdownChange,
} from "@/components/pages/analytics/custom-field-breakdown-card";
import { TicketTypeBreakdownCard } from "@/components/pages/analytics/ticket-type-breakdown-card";
import { Button } from "@/components/ui/button";
import { useReportLanguage } from "@/hooks/use-report-language";
import { getEventById } from "@/lib/api/event";
import type { CustomFieldBreakdownRow } from "@/lib/api/event/analytics";

interface CustomDashboardPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

/**
 * Standalone chart dashboard driven by the same "show count / split by"
 * selectors as Custom Reports. The ticket breakdown card mounts invisibly
 * (its query feeds the charts); the custom field card renders selectors-only.
 */
export default function CustomDashboardPage({
	params,
}: CustomDashboardPageProps) {
	const { event_id } = use(params);
	const { labels } = useReportLanguage();

	useQuery({
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

	return (
		<div className="space-y-4">
			<div className="flex justify-end gap-2">
				<Button asChild variant="outline" className="rounded-none" size="sm">
					<Link href={`/event/${event_id}/custom-reports` as Route}>
						<Table2 className="mr-1 h-4 w-4" />
						{labels.tableView}
					</Link>
				</Button>
			</div>

			<div className="hidden">
				<TicketTypeBreakdownCard
					eventId={event_id}
					onDataChange={setTicketTypeRows}
					onLoadingChange={setTicketTypeLoading}
				/>
			</div>

			<CustomFieldBreakdownCard
				eventId={event_id}
				onDataChange={setCustomField}
				onLoadingChange={setCustomFieldLoading}
				selectorsOnly
			/>

			<CustomDashboardView
				eventId={event_id}
				ticketTypeRows={ticketTypeRows}
				ticketTypeLoading={ticketTypeLoading}
				customField={customField}
				customFieldLoading={customFieldLoading}
			/>
		</div>
	);
}
