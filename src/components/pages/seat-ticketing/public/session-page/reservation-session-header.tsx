"use client";

import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { getSessionDateDisplay } from "../utils";
import { CountdownTimer } from "./components/countdown-timer";
import { SectionNavigator } from "./components/section-navigator";
import { usePublicSeatLifecycleState } from "./hooks/use-public-seat-reservation";
import { usePublicSeatStore } from "./stores/public-seat-store";

interface ReservationSessionHeaderProps {
	session: EventSeatSession | null;
	eventTitle?: string | null;
	eventSlug: string | null;
}

export default function ReservationSessionHeader({
	session,
	eventTitle,
	eventSlug,
}: ReservationSessionHeaderProps) {
	const { expiresAt } = usePublicSeatLifecycleState();
	const isWarning = usePublicSeatStore((state) => state.isWarning);

	const dateDisplay = session ? getSessionDateDisplay(session) : null;
	const dateRange = [dateDisplay?.dayRange, dateDisplay?.monthRange]
		.filter(Boolean)
		.join(" • ");

	const backHref = eventSlug
		? (`/events/${eventSlug}/seat-reservations` as Route)
		: null;

	const headerClasses = isWarning
		? "bg-yellow-400 text-yellow-950 transition-colors duration-500"
		: "bg-brand-green text-white transition-colors duration-500";

	return (
		<div className="flex flex-col shadow-sm">
			<header className={cn("w-full px-4 py-3", headerClasses)}>
				<div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-4">
					<div className="flex items-center gap-6">
						{backHref ? (
							<Link
								href={backHref}
								className={cn(
									"inline-flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:opacity-70",
									isWarning ? "text-yellow-900" : "text-white/80",
								)}
							>
								<ArrowLeftIcon className="h-4 w-4" />
								<span className="hidden md:inline">Catalogue</span>
							</Link>
						) : (
							<div className="h-4 w-4" />
						)}

						<div className="flex flex-col leading-tight">
							<h1 className="font-black text-sm uppercase tracking-tight md:text-base">
								{session?.name ?? "Seat Reservation"}
							</h1>
							{eventTitle && (
								<p
									className={cn(
										"hidden font-medium text-[10px] lg:block",
										isWarning ? "text-yellow-900/70" : "text-white/70",
									)}
								>
									{eventTitle} {dateRange && `• ${dateRange}`}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div
							className={cn(
								"hidden items-center gap-4 border-r pr-4 lg:flex",
								isWarning ? "border-yellow-900/20" : "border-white/20",
							)}
						>
							{session?.location && (
								<div
									className={cn(
										"flex items-center gap-1.5 font-bold text-[10px] uppercase",
										isWarning ? "text-yellow-900/80" : "text-white/80",
									)}
								>
									<MapPinIcon className="h-3 w-3" />
									{session.location}
								</div>
							)}
						</div>
						<CountdownTimer expiresAt={expiresAt} />
					</div>
				</div>
			</header>

			<SectionNavigator />
		</div>
	);
}
