"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getPublicSession } from "@/lib/api/seat-ticketing";

const STALE_TIME_MS = 1000 * 60 * 5;

export default function SeatReservationSessionPage() {
	const params = useParams();
	const identifier = params["slug-or-public-id"] as string | undefined;

	const {
		data: session,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["public-seat-session", identifier],
		queryFn: () => getPublicSession({ idOrSlugOrPublicId: identifier ?? "" }),
		enabled: Boolean(identifier),
		retry: 2,
		staleTime: STALE_TIME_MS,
	});

	return (
		<main className="min-h-screen bg-slate-50 px-4 py-10">
			<div className="mx-auto w-full max-w-4xl">
				<h1 className="text-2xl font-semibold text-slate-900">
					Seat Reservation Session
				</h1>

				{isLoading && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-600">Loading session...</p>
					</div>
				)}

				{error && (
					<div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
						{error instanceof Error
							? error.message
							: "Unable to load session."}
					</div>
				)}

				{session && (
					<div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm font-medium text-slate-700">
							Session JSON
						</p>
						<pre className="mt-4 max-h-[70vh] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
							{JSON.stringify(session, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</main>
	);
}
