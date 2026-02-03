"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEventSeatReservationsSafe } from "@/components/pages/seat-ticketing/public/event-seat-reservations-provider";
import { getAllPublicSession } from "@/lib/api/seat-ticketing";

const STALE_TIME_MS = 1000 * 60 * 5;

export default function SeatReservationsPage() {
	const context = useEventSeatReservationsSafe();
	const params = useParams();
	const slugFromParams = params.slug as string | undefined;
	const slug = context?.eventSlug ?? slugFromParams ?? null;

	const {
		data: sessions,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-seat-sessions", slug],
		queryFn: () => getAllPublicSession({ eventSlug: slug ?? "" }),
		enabled: Boolean(slug),
		retry: 2,
		staleTime: STALE_TIME_MS,
	});

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-10">
			<div className="mx-auto w-full max-w-4xl">
				<h1 className="text-2xl font-semibold text-slate-900">
					Seat Reservations
				</h1>

				{context?.publicEvent && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm font-medium text-slate-700">
							Public event JSON
						</p>
						<pre className="mt-4 max-h-[40vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
							{JSON.stringify(context.publicEvent, null, 2)}
						</pre>
					</div>
				)}

				{isLoading && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-600">Loading public sessions...</p>
					</div>
				)}

				{error && (
					<div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
						{error instanceof Error
							? error.message
							: "Unable to load public sessions."}
					</div>
				)}

				{sessions && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm font-medium text-slate-700">
							Public sessions JSON
						</p>
						<pre className="mt-4 max-h-[70vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
							{JSON.stringify(sessions, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</main>
	);
}
