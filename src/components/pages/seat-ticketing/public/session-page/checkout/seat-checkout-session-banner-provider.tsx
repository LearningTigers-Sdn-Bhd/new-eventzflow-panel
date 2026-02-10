"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { clearCheckoutSessionLocks, getCheckoutSession } from "@/lib/api/seat-ticketing";
import type { EventSeatCheckoutSession } from "@/lib/api/seat-ticketing/response";
import { useSeatCheckoutSessionStore } from "@/stores/seat-checkout-session-store";

const WARNING_THRESHOLD_SECONDS = 120;

const formatTime = (totalSeconds: number) => {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

interface SeatCheckoutSessionBannerProviderProps {
	children?: ReactNode;
	sessionIdentifier: string;
	eventSlug: string;
}

export default function SeatCheckoutSessionBannerProvider({
	children,
	sessionIdentifier,
	eventSlug,
}: SeatCheckoutSessionBannerProviderProps) {
	const router = useRouter();
	const params = useParams();
	const checkoutSessionUuid = useSeatCheckoutSessionStore(
		(state) => state.checkoutSessionUuid,
	);
	const clearCheckoutSessionUuid = useSeatCheckoutSessionStore(
		(state) => state.clearCheckoutSessionUuid,
	);
	const [expiresAt, setExpiresAt] = useState<string | null>(null);
	const [now, setNow] = useState(() => Date.now());
	const expiredRef = useRef(false);
	const expiredToastShownRef = useRef(false);

	const storageKey = useMemo(() => {
		if (!checkoutSessionUuid) return null;
		return `seat-checkout-expires-at:${checkoutSessionUuid}`;
	}, [checkoutSessionUuid]);

	const { data: checkoutSession } = useQuery<EventSeatCheckoutSession | null>({
		queryKey: ["seat-checkout-session", checkoutSessionUuid],
		queryFn: async () => {
			if (!checkoutSessionUuid) return null;
			try {
				return await getCheckoutSession({ checkoutSessionUuid });
			} catch {
				// If the server returns 404, the session is expired or deleted.
				// We return null so the banner disappears, but we KEEP the UUID
				// so the user's identity remains stable.
				return null;
			}
		},
		enabled: Boolean(checkoutSessionUuid),
		retry: false,
		staleTime: 10000,
		refetchInterval: (query) =>
			checkoutSessionUuid && query.state.data === null ? 1000 : false,
	});

	useEffect(() => {
		if (!checkoutSession || !storageKey) return;
		setExpiresAt(checkoutSession.expires_at);
		localStorage.setItem(storageKey, checkoutSession.expires_at);
	}, [checkoutSession, storageKey]);

	useEffect(() => {
		if (!storageKey) return;
		const stored = localStorage.getItem(storageKey);
		if (stored) {
			setExpiresAt(stored);
		}
	}, [storageKey]);

	useEffect(() => {
		if (!storageKey) return;
		const handleStorage = (event: StorageEvent) => {
			if (event.key !== storageKey || !event.newValue) return;
			setExpiresAt(event.newValue);
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [storageKey]);

	useEffect(() => {
		if (!expiresAt) return;
		const interval = window.setInterval(() => {
			setNow(Date.now());
		}, 1000);
		return () => window.clearInterval(interval);
	}, [expiresAt]);

	useEffect(() => {
		if (checkoutSessionUuid) return;
		setExpiresAt(null);
		expiredRef.current = false;
	}, [checkoutSessionUuid]);

	const timeLeftSeconds = useMemo(() => {
		if (!expiresAt) return null;
		const expiresAtMs = new Date(expiresAt).getTime();
		const diffSeconds = Math.floor((expiresAtMs - now) / 1000);
		return Math.max(diffSeconds, 0);
	}, [expiresAt, now]);

	const isWarning =
		timeLeftSeconds !== null && timeLeftSeconds <= WARNING_THRESHOLD_SECONDS;

	useEffect(() => {
		if (timeLeftSeconds === null || timeLeftSeconds > 0) return;
		if (expiredRef.current) return;
		expiredRef.current = true;

		const expireSeats = async () => {
			if (storageKey) {
				localStorage.removeItem(storageKey);
			}
			if (checkoutSessionUuid) {
				try {
					await clearCheckoutSessionLocks({ checkoutSessionUuid });
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to clear expired seats";
					toast.error(message);
				}
			}
			clearCheckoutSessionUuid();
			if (!expiredToastShownRef.current) {
				expiredToastShownRef.current = true;
				toast.error("Reservation expired. Please select seats again.", {
					id: "seat-reservation-expired",
				});
			}
			const slug = (params.slug as string | undefined) ?? eventSlug;
			const identifier =
				(params["slug-or-public-id"] as string | undefined) ??
				sessionIdentifier;
			if (slug && identifier) {
				router.push(
					`/events/${slug}/seat-reservations/${identifier}` as Route,
				);
			}
		};

		expireSeats();
	}, [
		checkoutSessionUuid,
		clearCheckoutSessionUuid,
		eventSlug,
		params,
		router,
		sessionIdentifier,
		storageKey,
		timeLeftSeconds,
	]);

	const shouldShowBanner = timeLeftSeconds !== null && timeLeftSeconds > 0;
	const bannerClasses = isWarning
		? "border-amber-300 bg-amber-50 text-amber-900"
		: "border-emerald-300 bg-emerald-50 text-emerald-900";

	return (
		<>
			{shouldShowBanner && (
				<div
					id="seat-checkout-banner"
					className={`fixed inset-x-0 top-0 z-50 w-full border-b px-4 py-3 text-sm ${bannerClasses}`}
				>
					<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
						<div className="font-semibold">
							Your seats are reserved for a limited time.
						</div>
						<div className="text-xs font-bold uppercase tracking-widest">
							{isWarning ? "Hurry up" : "Time left"} · {" "}
							<span className="font-mono text-sm">
								{formatTime(timeLeftSeconds)}
							</span>
						</div>
					</div>
				</div>
			)}
			{children ?? null}
		</>
	);
}
