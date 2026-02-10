"use client";

import { Image } from "@unpic/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SeatReservationsNotFoundPage() {
	const params = useParams();
	const eventSlug = params.slug as string | undefined;
	const redirectTo = eventSlug
		? `/events/${eventSlug}/seat-reservations`
		: "/";
	const redirectLabel = eventSlug
		? "Back to Seat Reservations"
		: "Go Back";

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center">
			<div className="max-w-md space-y-4">
				<Image
					src="https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&q=80&w=600&h=600"
					alt="Event Not Found Cartoon"
					width={192}
					height={192}
					className="mx-auto h-48 w-48 object-contain"
				/>
				<h1 className="font-bold text-6xl text-gray-900 tracking-tight sm:text-7xl">
					Uh oh.
				</h1>
				<p className="font-medium text-gray-600 text-xl">
					This seat reservation session doesn&apos;t exist.
				</p>
				<p className="text-gray-500">
					Check the session link or return to the reservation catalogue.
				</p>
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link href="/" passHref>
						<Button className="w-full rounded-none sm:w-auto">
							Go to Homepage
						</Button>
					</Link>
					<Link href={redirectTo} passHref>
						<Button
							variant="outline"
							className="w-full rounded-none sm:w-auto"
						>
							{redirectLabel}
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
