import type { PublicEventInfo } from "@/lib/api/event/endpoints";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import EventSeatReservationsTicketingCard from "./event-seat-reservations-ticketing-card";

interface EventSeatReservationsTicketingProps {
	event: PublicEventInfo | null;
	sessions?: EventSeatSession[];
	isLoading: boolean;
	error: unknown;
	eventSlug: string | null;
	isHydrated?: boolean;
}

export default function EventSeatReservationsTicketing({
	event,
	sessions,
	isLoading,
	error,
	eventSlug,
	isHydrated = false,
}: EventSeatReservationsTicketingProps) {
	const hasError = Boolean(error);
	const errorMessage =
		error instanceof Error ? error.message : "Unable to load public sessions.";

	return (
		<div className="grid gap-6">
			<section className="flex flex-col gap-2 md:gap-4 min-h-[150px] md:min-h-[200px] border-b border-brand-green mb-5">
				<h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-emerald-500">
					Event Description
				</h2>
				<p className="text-sm md:text-base text-emerald-900 italic ml-4">
					{event?.description ??
						"Seat reservations are now open. Choose a session and reserve your seat."}
				</p>
			</section>

			<section className="min-h-[calc(100vh-100px)] flex flex-col gap-2 md:gap-4">
				<div className="flex flex-col gap-0.5">
					<h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-emerald-500">
						Ticketing
					</h2>
					<p className="text-sm md:text-base text-emerald-900">
						Pick a session to continue with seat reservation.
					</p>
				</div>

				{isLoading && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
						<p className="text-sm text-slate-600">Loading public sessions...</p>
					</div>
				)}

				{hasError && (
					<div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
						{errorMessage}
					</div>
				)}

				{!isLoading && !error && (!sessions || sessions.length === 0) && (
					<div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
						<p className="text-sm text-slate-600">
							No sessions are available yet.
						</p>
					</div>
				)}

				{sessions && sessions.length > 0 && (
					<div className="mt-6 space-y-8">
						{sessions.map((session) => (
							<EventSeatReservationsTicketingCard
								key={session.id}
								session={session}
								eventSlug={eventSlug}
								showPrices={isHydrated}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
