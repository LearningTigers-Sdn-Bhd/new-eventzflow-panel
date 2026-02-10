import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import { getSessionDateDisplay, getSessionTimeRange } from "../utils";

interface SeatReservationSessionHeaderProps {
	session: EventSeatSession | null;
	eventTitle?: string | null;
	eventSlug: string | null;
}

export default function SeatReservationSessionHeader({
	session,
	eventTitle,
	eventSlug,
}: SeatReservationSessionHeaderProps) {
	const dateDisplay = session ? getSessionDateDisplay(session) : null;
	const timeRange = session ? getSessionTimeRange(session) : null;
	const dateRange = [dateDisplay?.dayRange, dateDisplay?.monthRange]
		.filter(Boolean)
		.join(" • ");
	const backHref = eventSlug
		? (`/events/${eventSlug}/seat-reservations` as Route)
		: null;

	return (
		<header className="w-full min-h-[200px] bg-brand-green px-4 py-8 text-white md:min-h-[220px] md:py-16">
			<div className="container mx-auto flex max-w-7xl flex-col gap-4 md:gap-5">
				<div className="flex flex-col gap-3">
					<div className="space-y-3">
						{backHref ? (
							<Link
								href={backHref}
								className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white md:text-xs"
							>
								<ArrowLeftIcon className="h-3 w-3" />
								View Reservation Catalogue
							</Link>
						) : (
							<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 md:text-xs">
								View Reservation Catalogue
							</p>
						)}
						<div className="space-y-2">
							<h1 className="text-2xl font-black uppercase tracking-tight text-white md:text-3xl">
								{session?.name ?? "Seat Reservation Session"}
							</h1>
							{eventTitle && (
								<p className="max-w-3xl text-xs text-white/80 md:text-sm">
									{eventTitle}
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-1 text-xs text-white/80 md:text-sm">
					{dateRange && (
						<div className="flex flex-row items-center gap-2">
							<div className="flex items-center gap-2">
								<CalendarIcon className="h-4 w-4" />
								<span className="text-xs font-semibold uppercase leading-none text-white/70">
									Dates
								</span>
							</div>
							<span className="text-xs font-mono uppercase md:text-sm">
								: {dateRange}
							</span>
						</div>
					)}
					{timeRange && (
						<div className="flex flex-row items-center gap-2">
							<div className="flex items-center gap-2">
								<CalendarIcon className="h-4 w-4" />
								<span className="text-xs font-semibold uppercase leading-none text-white/70">
									Time
								</span>
							</div>
							<span className="text-xs font-mono uppercase md:text-sm">
								: {timeRange}
							</span>
						</div>
					)}
					{session?.location && (
						<div className="flex flex-row items-center gap-2">
							<div className="flex items-center gap-2">
								<MapPinIcon className="h-4 w-4" />
								<span className="text-xs font-semibold uppercase leading-none text-white/70">
									Location
								</span>
							</div>
							<span className="text-xs font-mono uppercase md:text-sm">
								: {session.location}
							</span>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
