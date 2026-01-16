import { redirect } from "next/navigation";
import { getEventById } from "@/lib/api/event";

interface AnalyticsPageProps {
	params: Promise<{
		event_id: string;
	}>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
	const { event_id } = await params;

	try {
		// Fetch event to determine type
		const event = await getEventById(event_id);
		const isTicketEvent = event.use_ticket !== false;

		// Redirect to appropriate analytics page
		if (isTicketEvent) {
			redirect(`/event/${event_id}/analytics/ticket`);
		} else {
			redirect(`/event/${event_id}/analytics/visitor`);
		}
	} catch {
		// Default to ticket analytics if event fetch fails
		redirect(`/event/${event_id}/analytics/ticket`);
	}
}
