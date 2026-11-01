import { format } from "date-fns";
import { UserCheck } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEventDetails } from "@/hooks/use-event-details";
import type { HeadcountRollup } from "@/lib/api/event/hall";
import { StatTile } from "./stat-tile";

/** "9:00 AM – 6:00 PM" from the event's daily start/end ("09:00" or an ISO time); null when unknown. */
function eventHours(start?: string | null, end?: string | null): string | null {
	const clock = (value?: string | null) => {
		const match = value?.match(/(\d{2}):(\d{2})/);
		if (!match) return null;
		return format(
			new Date(2000, 0, 1, Number(match[1]), Number(match[2])),
			"h:mm a",
		);
	};
	const from = clock(start);
	const to = clock(end);
	return from && to ? `${from} – ${to}` : null;
}

/** The headline for organizers: how many people came to the event today and in total. Day-by-day and per-hall detail lives on Trends. */
export function VisitorsSummary({
	event,
	eventId,
}: {
	event: HeadcountRollup;
	eventId: string;
}) {
	const { data: details } = useEventDetails(eventId);
	const hours = eventHours(details?.start_time, details?.end_time);

	return (
		<Card className="gap-0 rounded-none shadow-none">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<UserCheck className="size-4" />
					Visitors
				</CardTitle>
				<CardDescription className="text-xs">
					People who came in through the doors. Someone who leaves and comes
					back is counted again. Day by day is under Trends.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-5">
				<div className="grid @xl:grid-cols-2 grid-cols-1 gap-2">
					<StatTile
						label="Visitors today"
						value={event.inToday}
						hint={hours ? `Came in ${hours}` : "Came in since midnight"}
						accent="border-l-emerald-500"
					/>
					<StatTile
						label="Visitors · whole event"
						value={event.inEvent}
						hint="Event start to end"
						accent="border-l-sky-500"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
