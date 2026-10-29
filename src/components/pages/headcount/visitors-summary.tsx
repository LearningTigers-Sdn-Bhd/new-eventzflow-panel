import { UserCheck } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { HeadcountRollup } from "@/lib/api/event/hall";
import { StatTile } from "./stat-tile";

/** The headline for organizers: how many people came to the event today and in total. Day-by-day and per-hall detail lives on Trends. */
export function VisitorsSummary({ event }: { event: HeadcountRollup }) {
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
						hint="Came in since midnight"
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
