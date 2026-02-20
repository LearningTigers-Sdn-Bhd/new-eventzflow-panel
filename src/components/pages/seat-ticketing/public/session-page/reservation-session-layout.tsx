"use client";

import dynamic from "next/dynamic";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import SeatReservationCanvasWrapper from "./components/canvas/seat-reservation-canvas-wrapper";
import ReservationSessionHeader from "./reservation-session-header";

const ReservationSessionCheckout = dynamic(
	() => import("./reservation-session-checkout"),
	{ ssr: false },
);

const ReservationSessionMobileBar = dynamic(
	() => import("./reservation-session-mobile-bar"),
	{ ssr: false },
);

interface ReservationSessionLayoutProps {
	session: EventSeatSession | null;
	eventTitle?: string | null;
	eventSlug: string | null;
}

export default function ReservationSessionLayout({
	session,
	eventTitle,
	eventSlug,
}: ReservationSessionLayoutProps) {
	return (
		<div className="flex h-screen flex-col overflow-hidden bg-slate-50">
			{/* Sticky Header */}
			<div className="z-30 shrink-0">
				<ReservationSessionHeader
					session={session}
					eventTitle={eventTitle}
					eventSlug={eventSlug}
				/>
			</div>

			{/* Main Interactive Area - Fills remaining height */}
			<main className="flex min-h-0 flex-1 flex-col divide-x divide-slate-200 pb-[calc(12rem+env(safe-area-inset-bottom))] lg:flex-row lg:pb-0">
				{/* The Canvas (Venue/Section) */}
				<div className="relative min-h-0 flex-1 bg-slate-100">
					<SeatReservationCanvasWrapper />
				</div>

				{/* The Sidebar (Checkout) - Fixed width, internal scroll */}
				<aside className="hidden min-h-0 w-full shrink-0 bg-white lg:block lg:w-[400px]">
					<ReservationSessionCheckout />
				</aside>
			</main>

			<ReservationSessionMobileBar />
		</div>
	);
}
