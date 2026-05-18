import { CalendarIcon, MapPinIcon } from "lucide-react";
import type { PublicEventInfo } from "@/lib/api/event/endpoints";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import { formatEventDateRange, getUniqueLocations } from "./utils";

interface EventSeatReservationsHeaderProps {
	event: PublicEventInfo | null;
	sessions?: EventSeatSession[];
}

export default function EventSeatReservationsHeader({
	event,
	sessions,
}: EventSeatReservationsHeaderProps) {
	const dateRange = formatEventDateRange(event);
	const locations = getUniqueLocations(sessions);

	return (
		<header className="min-h-[220px] w-full bg-brand-green px-4 py-10 text-white">
			<div className="container mx-auto max-w-7xl space-y-4">
				<p className="font-semibold text-white/70 text-xs uppercase tracking-[0.2em] underline decoration-white/50 underline-offset-4">
					Event Seat Reservations
				</p>
				<div className="space-y-2">
					<h1 className="font-black text-3xl text-white uppercase tracking-tight md:text-4xl">
						{event?.title ?? "Seat Reservations"}
					</h1>
					{event?.description && (
						<p className="max-w-3xl text-sm text-white/80">
							{event.description}
						</p>
					)}
				</div>
				<div className="flex flex-col gap-4 text-sm text-white/80">
					{dateRange && (
						<div className="flex flex-col gap-1">
							<div className="flex items-end gap-2">
								<CalendarIcon className="h-4 w-4" />
								<span className="font-semibold text-white/70 text-xs uppercase leading-none">
									Dates
								</span>
							</div>
							<span className="font-mono text-sm uppercase">{dateRange}</span>
						</div>
					)}
					{locations.length > 0 && (
						<div className="flex flex-col gap-1">
							<div className="flex items-end gap-2">
								<MapPinIcon className="h-4 w-4" />
								<span className="font-semibold text-white/70 text-xs uppercase leading-none">
									Locations
								</span>
							</div>
							<span className="font-mono text-sm uppercase">
								{locations.join(", ")}
							</span>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
