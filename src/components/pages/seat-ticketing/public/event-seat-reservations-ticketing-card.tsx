import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import {
	getSeatAvailability,
	getSessionDateDisplay,
	getSessionIdentifier,
	getSessionPrices,
	getSessionTimeRange,
} from "./utils";

interface EventSeatReservationsTicketingCardProps {
	session: EventSeatSession;
	eventSlug: string | null;
	showPrices?: boolean;
}

export default function EventSeatReservationsTicketingCard({
	session,
	eventSlug,
	showPrices = true,
}: EventSeatReservationsTicketingCardProps) {
	const { dayRange, monthRange, isMultiDay } = getSessionDateDisplay(session);
	const timeRange = getSessionTimeRange(session);
	const prices = getSessionPrices(session);
	const availability = getSeatAvailability(session);
	const sessionId = getSessionIdentifier(session);
	const href = eventSlug
		? (`/events/${eventSlug}/seat-reservations/${sessionId}` as Route)
		: null;
	const buttonClass =
		"rounded-none bg-brand-green text-white w-full md:w-auto min-w-[180px] py-6 md:py-2 uppercase";

	return (
		<div className="relative flex flex-col gap-4 rounded-none border border-[color:var(--color-brand-green)] bg-white shadow-sm sm:flex-row">
			<div className="w-full md:max-w-[180px] bg-brand-green p-4 text-white flex flex-col justify-center">
				<div className="flex md:justify-center md:items-center items-start gap-2 text-xs uppercase tracking-[0.2em] text-emerald-50">
					<CalendarIcon className="size-16" />
				</div>
				<div className="flex flex-col md:justify-center md:items-center items-start w-full">
					<p className="mt-3 text-2xl font-black tracking-tight text-emerald-50">
						{dayRange ?? "TBA"}
					</p>
					<p className="text-sm font-mono uppercase text-emerald-50">
						{monthRange ?? "Date to be announced"}
					</p>
				</div>
			</div>
			<div className="w-full flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
				<div className="w-full flex flex-col justify-between items-start h-full px-2 py-0 md:py-3">
					<span className="inline-flex uppercase text-lg font-semibold text-emerald-800">
						{session.name}
					</span>
					<div className="h-full flex flex-col justify-end items-start pb-2">
						<div className="mt-2 flex flex-col gap-1 text-sm text-slate-500">
							{session.location && (
								<span className="inline-flex items-center gap-1 text-emerald-500 uppercase">
									<MapPinIcon className="h-4 w-4" />
									{session.location}
								</span>
							)}
							{!isMultiDay && timeRange && (
								<span className="inline-flex items-center gap-1 text-emerald-500 uppercase">
									<CalendarIcon className="h-4 w-4" />
									{timeRange}
								</span>
							)}
						</div>
						{showPrices && prices.length > 0 && (
							<div className="mt-1 flex flex-col items-start gap-1">
								<span className="inline-flex items-center gap-1 text-sm uppercase text-emerald-500">
									<TicketIcon className="h-4 w-4" />
									Prices
								</span>
								<div className="flex flex-wrap gap-2">
									{prices.map((price) => (
										<Badge
											key={price}
											className="rounded-none bg-brand-blue text-cyan-900"
										>
											{price}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				{availability.label && (
					<Badge
						className={`absolute left-1 top-0 min-w-[110px] -translate-y-1/2 rounded-none border uppercase ${
							availability.isFull
								? "border-red-500 bg-red-300 text-red-800"
								: "border-amber-500 bg-amber-300 text-amber-800"
						}`}
					>
						{availability.label}
					</Badge>
				)}
			<div className="w-full md:max-w-[200px] flex flex-col items-center gap-3">
				{href ? (
					<Button asChild variant="default" className={buttonClass}>
						<Link href={href}>
							{availability.isFull ? "View Details" : "Book Now"}
						</Link>
					</Button>
				) : (
					<Button variant="default" disabled className={buttonClass}>
						{availability.isFull ? "View Details" : "Book Now"}
					</Button>
				)}
			</div>
			</div>
		</div>
	);
}
