"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { getCheckoutSession } from "@/lib/api/seat-ticketing/endpoints";
import type { EventSeatSession } from "@/lib/api/seat-ticketing/response";
import { useReservationLifecycle } from "../hooks/use-reservation-lifecycle";
import { useReservationSync } from "../hooks/use-reservation-sync";
import { usePublicSeatStore } from "../stores/public-seat-store";
import { useSeatCheckoutStore } from "../stores/seat-checkout-store";

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
 * SeatReservationSessionManager
 *
 * Orchestrates the initialization and real-time lifecycle of a seat reservation session.
 * This component replaces the previous "God Provider" and delegates logic to specialized hooks.
 */
export function SeatReservationSessionManager({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession: EventSeatSession;
}) {
	const store = usePublicSeatStore();
	const checkoutStore = useSeatCheckoutStore();

	const checkoutSessionUuid = checkoutStore.checkoutSessionUuid;
	const hasHydrated = checkoutStore.hasHydrated;
	const selectedSeatsCount = Object.keys(store.selectedSeats).length;
	const hasExpiry = !!store.expiresAt;
	const shouldValidatePersistedSession = selectedSeatsCount > 0 || hasExpiry;

	// 1. Manually trigger rehydration on mount (since skipHydration is true in the store)
	useEffect(() => {
		useSeatCheckoutStore.persist.rehydrate();
	}, []);

	// 2. Initialize Store with Initial Session (Diet Payload)
	useEffect(() => {
		if (initialSession) {
			store.initialize(initialSession);
		}
	}, [initialSession, store.initialize]);

	// 3. Initialize Checkout UUID if missing
	useEffect(() => {
		if (hasHydrated && !checkoutSessionUuid) {
			checkoutStore.setCheckoutSessionUuid(crypto.randomUUID());
		}
	}, [hasHydrated, checkoutSessionUuid, checkoutStore.setCheckoutSessionUuid]);

	// 3b. Validate persisted checkout session on each page load
	useEffect(() => {
		if (!hasHydrated || !checkoutSessionUuid || !shouldValidatePersistedSession)
			return;

		let cancelled = false;

		const validateCheckoutSession = async () => {
			try {
				await getCheckoutSession({ checkoutSessionUuid });
			} catch (error) {
				if (cancelled) return;

				const status = getErrorStatus(error);
				if (status === 404 || status === 410 || status === 422) {
					store.reset();
					checkoutStore.clearCheckoutSessionUuid();
				}
			}
		};

		void validateCheckoutSession();

		return () => {
			cancelled = true;
		};
	}, [
		hasHydrated,
		checkoutSessionUuid,
		shouldValidatePersistedSession,
		store.reset,
		checkoutStore.clearCheckoutSessionUuid,
	]);

	// 4. Activate Real-time Sync (ActionCable)
	useReservationSync();

	// 5. Activate Session Lifecycle (Heartbeat)
	useReservationLifecycle();

	return <>{children}</>;
}
