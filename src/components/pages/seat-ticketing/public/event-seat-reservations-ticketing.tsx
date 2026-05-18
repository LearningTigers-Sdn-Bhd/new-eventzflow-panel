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
			<section className="mb-5 flex min-h-[150px] flex-col gap-2 border-brand-green border-b md:min-h-[200px] md:gap-4">
				<h2 className="font-black text-2xl text-emerald-500 uppercase tracking-tight md:text-3xl">
					Event Description
				</h2>
				<p className="ml-4 text-emerald-900 text-sm italic md:text-base">
					{event?.description ??
						"Seat reservations are now open. Choose a session and reserve your seat."}
				</p>
			</section>

			<section className="flex min-h-[calc(100vh-100px)] flex-col gap-2 md:gap-4">
				<div className="flex flex-col gap-0.5">
					<h2 className="font-black text-2xl text-emerald-500 uppercase tracking-tight md:text-3xl">
						Ticketing
					</h2>
					<p className="text-emerald-900 text-sm md:text-base">
						Pick a session to continue with seat reservation.
					</p>
				</div>

				{isLoading && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
						<p className="text-slate-600 text-sm">Loading public sessions...</p>
					</div>
				)}

				{hasError && (
					<div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
						{errorMessage}
					</div>
				)}

				{!isLoading && !error && (!sessions || sessions.length === 0) && (
					<div className="mt-6 rounded-xl border border-slate-200 border-dashed bg-slate-50 p-6">
						<p className="text-slate-600 text-sm">
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
