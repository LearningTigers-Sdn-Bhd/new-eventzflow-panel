"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Maximize } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { use, useEffect, useState } from "react";
import { ArrivalDisplay } from "@/components/pages/rfid/arrival-display";
import { useFullscreen } from "@/hooks/surprise/shared/use-fullscreen";
import { getEventById } from "@/lib/api/event";
import { getRfidDisplayActivity, type RfidDisplayMode } from "@/lib/api/rfid";

export default function RfidDisplayPage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const [mode, setMode] = useQueryState(
		"mode",
		parseAsStringLiteral(["in", "out", "both"]).withDefault("in"),
	);
	const [now, setNow] = useState(0);
	const { isFullscreen, toggleFullscreen, fullscreenError } = useFullscreen();
	const event = useQuery({
		queryKey: ["event", event_id, "display-details"],
		queryFn: () => getEventById(event_id),
		staleTime: 60_000,
		meta: { suppressErrorToast: true },
	});
	const arrivals = useQuery({
		queryKey: ["event", event_id, "rfid", "display", mode],
		queryFn: () => getRfidDisplayActivity(event_id, mode),
		refetchInterval: 2_000,
		refetchIntervalInBackground: true,
		meta: { suppressErrorToast: true },
	});
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 2_000);
		return () => clearInterval(timer);
	}, []);
	const status = arrivals.isPending
		? "loading"
		: arrivals.isError || (now > 0 && now - arrivals.dataUpdatedAt > 15_000)
			? "offline"
			: "live";
	return (
		<ArrivalDisplay
			title={event.data?.title || "Welcome"}
			logoUrl={event.data?.logo_url}
			activity={arrivals.data?.activity ?? []}
			mode={mode}
			status={status}
			controls={
				<>
					<label className="flex items-center gap-2 text-sm">
						Show
						<select
							aria-label="Display mode"
							value={mode}
							onChange={(event) =>
								setMode(event.target.value as RfidDisplayMode)
							}
						>
							<option value="in">In only</option>
							<option value="out">Out only</option>
							<option value="both">Both</option>
						</select>
					</label>
					<a href={`/event/${event_id}/rfid`}>
						<ArrowLeft aria-hidden="true" />
						Dashboard
					</a>
					<button
						type="button"
						onClick={toggleFullscreen}
						aria-pressed={isFullscreen}
					>
						<Maximize aria-hidden="true" />
						{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
					</button>
					{fullscreenError && <span role="status">{fullscreenError}</span>}
				</>
			}
		/>
	);
}
