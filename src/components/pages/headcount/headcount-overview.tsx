"use client";

import { Activity, DoorOpen, Layers, Users } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { HEADCOUNT_REFRESH_MS, useHeadcount } from "@/hooks/use-event-halls";
import type { HeadcountRollup } from "@/lib/api/event/hall";
import { capacityAlerts } from "./alerts";
import { BigScreenLink } from "./big-screen-link";
import { CapacityAlerts } from "./capacity-alerts";
import { FiguresSummary } from "./figures-summary";
import { floorLabel } from "./format";
import { HallCard } from "./hall-card";

/** The headline panel: everyone inside right now, then today's and the whole event's traffic. */
function LiveStatus({ event }: { event: HeadcountRollup }) {
	return (
		<Card className="gap-0 rounded-none shadow-none">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<Activity className="size-4" />
					Live status
				</CardTitle>
				<CardDescription className="text-xs">
					People inside this event right now
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-5">
				<FiguresSummary figures={event} capacityLabel="total" />
			</CardContent>
		</Card>
	);
}

interface HeadcountOverviewProps {
	eventId: string;
	/** Org owners can set things up; everyone else only sees the data. */
	canManage: boolean;
	onOpenSettings: () => void;
}

/** Live people counts for an event: the headline, then each level (summary on top, its halls in a band below). Refreshes itself. */
export function HeadcountOverview({
	eventId,
	canManage,
	onOpenSettings,
}: HeadcountOverviewProps) {
	const { data, isLoading, error, refetch, dataUpdatedAt } =
		useHeadcount(eventId);

	if (isLoading) {
		return (
			<LoadingState
				title="Loading counts..."
				description="Fetching live numbers from the people counters."
				height="h-64"
			/>
		);
	}

	if (error || !data) {
		return (
			<ErrorState
				title="Failed to load counts"
				description="We couldn't load the people counts. Please try again."
				height="h-64"
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	if (!data.configured) {
		return (
			<EmptyState
				title="People counter isn't set up yet"
				description={
					canManage
						? "Connect this event to your counter service in Settings to see live counts here."
						: "Live counts will appear here once an organization owner sets up the people counter for this event."
				}
				icon={<Users />}
				height="h-64"
				action={
					canManage && (
						<Button onClick={onOpenSettings} className="rounded-none">
							Open settings
						</Button>
					)
				}
			/>
		);
	}

	if (data.halls.length === 0) {
		return (
			<EmptyState
				title="No halls yet"
				description={
					canManage
						? "Add the halls of this event in Settings, then link each one to a counter."
						: "Halls haven't been set up for this event yet."
				}
				icon={<DoorOpen />}
				height="h-64"
				action={
					canManage && (
						<Button onClick={onOpenSettings} className="rounded-none">
							Open settings
						</Button>
					)
				}
			/>
		);
	}

	return (
		<div className="@container space-y-4">
			<BigScreenLink />
			<CapacityAlerts alerts={capacityAlerts(data.halls)} />
			<LiveStatus event={data.event} />

			{data.levels.map((level) => {
				const halls = data.halls.filter((hall) => hall.floor === level.floor);

				return (
					<Card
						key={level.floor ?? "none"}
						className="gap-0 overflow-hidden rounded-none py-0 shadow-none"
					>
						<CardHeader className="border-b py-4">
							<CardTitle className="flex items-center gap-2 text-sm">
								<Layers className="size-4" />
								{floorLabel(level.floor)}
							</CardTitle>
							<CardDescription className="text-xs">
								Level total · {level.hallsCounted} of {level.halls}{" "}
								{level.halls === 1 ? "hall" : "halls"} counting
							</CardDescription>
						</CardHeader>
						<CardContent className="py-5">
							<FiguresSummary figures={level} capacityLabel="level" />
						</CardContent>
						<div className="space-y-3 border-t bg-muted/40 p-6">
							<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								Halls · {halls.length}
							</p>
							<div className="grid @4xl:grid-cols-3 @xl:grid-cols-2 gap-3">
								{halls.map((hall) => (
									<div key={hall.id} className="bg-background">
										<HallCard hall={hall} />
									</div>
								))}
							</div>
						</div>
					</Card>
				);
			})}

			<p className="flex items-center gap-2 text-muted-foreground text-xs">
				<span className="size-2 bg-emerald-500" aria-hidden="true" />
				Live · updated{" "}
				{new Date(dataUpdatedAt || data.generatedAt).toLocaleTimeString()} ·
				refreshes every {HEADCOUNT_REFRESH_MS / 1000} s
			</p>
		</div>
	);
}
