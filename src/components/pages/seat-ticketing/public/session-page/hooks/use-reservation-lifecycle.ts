"use client";

import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	checkoutSessionHeartbeat,
	clearCheckoutSessionLocks,
} from "@/lib/api/seat-ticketing/endpoints";
import { usePublicSeatStore } from "../stores/public-seat-store";
import { useSeatCheckoutStore } from "../stores/seat-checkout-store";

const HEARTBEAT_INTERVAL_MS = 60000;

function getErrorStatus(error: unknown): number | null {
	if (error && typeof error === "object") {
		if (
			"status" in error &&
			typeof (error as { status?: unknown }).status === "number"
		) {
			return (error as { status: number }).status;
		}

		if (
			"response" in error &&
			typeof (error as { response?: { status?: unknown } }).response?.status ===
				"number"
		) {
			return (error as { response: { status: number } }).response.status;
		}
	}

	return null;
}

/**
 * Hook to manage the lifecycle of a reservation session.
 * Handles heartbeats to prevent seat expiry and auto-redirects when expired.
 */
export function useReservationLifecycle() {
	const router = useRouter();
	const params = useParams();

	const checkoutSessionUuid = useSeatCheckoutStore(
		(state) => state.checkoutSessionUuid,
	);
	const clearCheckoutSessionUuid = useSeatCheckoutStore(
		(state) => state.clearCheckoutSessionUuid,
	);
	const hasHydrated = useSeatCheckoutStore((state) => state.hasHydrated);

	const selectedSeatsCount = usePublicSeatStore(
		(state) => Object.keys(state.selectedSeats).length,
	);
	const isProcessing = usePublicSeatStore((state) => state.isProcessing);
	const expiresAt = usePublicSeatStore((state) => state.expiresAt);
	const setExpiresAt = usePublicSeatStore((state) => state.setExpiresAt);
	const setIsWarning = usePublicSeatStore((state) => state.setIsWarning);
	const resetStore = usePublicSeatStore((state) => state.reset);

	const expiredToastShownRef = useRef(false);
	const invalidSessionToastShownRef = useRef(false);

	const handleInvalidCheckoutSession = useCallback(() => {
		resetStore();
		clearCheckoutSessionUuid();
		setIsWarning(false);
		setExpiresAt(null);

		if (!invalidSessionToastShownRef.current) {
			invalidSessionToastShownRef.current = true;
			toast.error(
				"Your reservation session is no longer valid. Please start again.",
				{
					id: "reservation-session-invalid",
				},
			);
		}
	}, [clearCheckoutSessionUuid, resetStore, setExpiresAt, setIsWarning]);

	const performHeartbeat = useCallback(async () => {
		if (!checkoutSessionUuid) return;
		try {
			const response = await checkoutSessionHeartbeat({ checkoutSessionUuid });
			setExpiresAt(response.expires_at);
			invalidSessionToastShownRef.current = false;
		} catch (error) {
			const status = getErrorStatus(error);
			if (status === 404 || status === 410 || status === 422) {
				handleInvalidCheckoutSession();
				return;
			}

			console.error("[ReservationLifecycle] Heartbeat failed:", error);
		}
	}, [checkoutSessionUuid, setExpiresAt, handleInvalidCheckoutSession]);

	// Heartbeat logic
	useEffect(() => {
		if (
			!hasHydrated ||
			!checkoutSessionUuid ||
			selectedSeatsCount === 0 ||
			isProcessing
		) {
			return;
		}

		performHeartbeat();

		const interval = setInterval(() => {
			performHeartbeat();
		}, HEARTBEAT_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [
		hasHydrated,
		checkoutSessionUuid,
		selectedSeatsCount,
		isProcessing,
		performHeartbeat,
	]);

	// Auto-expiry logic and Warning state management
	useEffect(() => {
		if (!expiresAt) {
			setIsWarning(false);
			return;
		}

		const checkExpiry = async () => {
			const now = Date.now();
			const expiry = new Date(expiresAt).getTime();
			const diff = expiry - now;

			// Update warning state (within 2 mins)
			setIsWarning(diff > 0 && diff <= 120000);

			if (diff <= 0) {
				// 1. Wipe local state
				if (checkoutSessionUuid) {
					try {
						await clearCheckoutSessionLocks({ checkoutSessionUuid });
					} catch (e) {
						console.error("Failed to clear locks on expiry", e);
					}
				}

				resetStore();
				clearCheckoutSessionUuid();

				// 2. Notify user
				if (!expiredToastShownRef.current) {
					expiredToastShownRef.current = true;
					toast.error(
						"Your reservation session has expired. Please start over.",
						{
							id: "reservation-expired",
						},
					);
				}

				// 3. Redirect back to session entry (refresh state)
				const slug = params.slug as string;
				const sessionId = params["slug-or-public-id"] as string;
				if (slug && sessionId) {
					router.push(
						`/events/${slug}/seat-reservations/${sessionId}` as Route,
					);
				}
			}
		};

		const interval = setInterval(checkExpiry, 5000);
		return () => clearInterval(interval);
	}, [
		expiresAt,
		checkoutSessionUuid,
		clearCheckoutSessionUuid,
		resetStore,
		setIsWarning,
		params,
		router,
	]);

	return { performHeartbeat };
}
