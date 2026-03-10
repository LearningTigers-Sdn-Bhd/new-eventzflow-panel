"use client";

import { ArrowLeftIcon, TicketIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SeatReservationNotFound() {
	const params = useParams();
	const eventSlug = params.slug as string | undefined;

	const backHref = eventSlug
		? (`/events/${eventSlug}/seat-reservations` as Route)
		: ("/events" as Route);

	return (
		<main className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
			<div className="mb-6 rounded-full bg-slate-100 p-6">
				<TicketIcon className="h-12 w-12 text-slate-400" />
			</div>

			<h1 className="mb-2 text-3xl font-black uppercase tracking-tight text-slate-900 md:text-4xl">
				Session Not Found
			</h1>

			<p className="mb-10 max-w-md text-slate-600">
				The seat reservation session you are looking for might have been
				cancelled, unpublished, or moved.
			</p>

			<div className="flex flex-col gap-3 sm:flex-row">
				<Button
					asChild
					variant="outline"
					className="h-12 rounded-none border-2 font-bold px-8 uppercase tracking-widest"
				>
					<Link href={backHref}>
						<ArrowLeftIcon className="mr-2 h-4 w-4" />
						Back to Catalogue
					</Link>
				</Button>

				<Button
					asChild
					className="h-12 rounded-none bg-brand-green font-bold px-8 uppercase tracking-widest hover:bg-brand-green/90"
				>
					<Link href={"/events" as Route}>Browse Events</Link>
				</Button>
			</div>
		</main>
	);
}
