"use client";

import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "../session-page/components/countdown-timer";
import { usePublicSeatLifecycleState } from "../session-page/hooks/use-public-seat-reservation";
import { usePublicSeatStore } from "../session-page/stores/public-seat-store";
import { getSessionDateDisplay } from "../utils";

interface ReservationCheckoutHeaderProps {
	eventTitle?: string | null;
}

export default function ReservationCheckoutHeader({
	eventTitle,
}: ReservationCheckoutHeaderProps) {
	const { expiresAt } = usePublicSeatLifecycleState();
	const session = usePublicSeatStore((state) => state.session);
	const isWarning = usePublicSeatStore((state) => state.isWarning);

	const params = useParams();
	const eventSlug = params.slug as string | undefined;
	const sessionIdentifier = params["slug-or-public-id"] as string | undefined;

	const dateDisplay = session ? getSessionDateDisplay(session) : null;
	const dateRange = [dateDisplay?.dayRange, dateDisplay?.monthRange]
		.filter(Boolean)
		.join(" • ");

	const backHref =
		eventSlug && sessionIdentifier
			? (`/events/${eventSlug}/seat-reservations/${sessionIdentifier}` as Route)
			: null;

	const headerClasses = isWarning
		? "bg-yellow-400 text-yellow-950 transition-colors duration-500"
		: "bg-brand-green text-white transition-colors duration-500";

	return (
		<header className={cn("w-full px-4 py-3 shadow-sm", headerClasses)}>
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
							BACK
						</Link>
					) : (
						<div className="h-4 w-4" />
					)}

					<div className="flex flex-col leading-tight">
						<h1 className="font-black text-sm uppercase tracking-tight md:text-base">
							{session?.name ?? "Complete Reservation"}
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
	);
}
