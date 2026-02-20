"use client";

import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkoutSession } from "@/lib/api/seat-ticketing/endpoints";
import { usePublicSeatStore } from "../stores/public-seat-store";
import { useSeatCheckoutStore } from "../stores/seat-checkout-store";

interface VisitorData {
	full_name: string;
	email: string;
	phone: string;
}

/**
 * Hook to handle the final checkout process for seat reservations.
 */
export function useReservationCheckout() {
	const router = useRouter();
	const params = useParams();

	const store = usePublicSeatStore();
	const checkoutStore = useSeatCheckoutStore();

	const checkoutSessionUuid = checkoutStore.checkoutSessionUuid;

	const checkout = async (visitorData: VisitorData, ticketTypeId?: number) => {
		const selectedSeatIds = Object.keys(store.selectedSeats).map(Number);

		if (selectedSeatIds.length === 0) {
			toast.error("Please select at least one seat");
			return;
		}

		if (!checkoutSessionUuid) {
			toast.error("Session expired. Please refresh the page.");
			return;
		}

		if (!store.session) {
			toast.error("Session data is unavailable. Please refresh the page.");
			return;
		}

		store.setProcessing(true);

		try {
			await checkoutSession({
				sessionId: store.session.id.toString(),
				seat_ids: selectedSeatIds,
				visitor: visitorData,
				checkout_session_uuid: checkoutSessionUuid,
				ticket_type_id: ticketTypeId,
			});

			toast.success("Reservation successful!");

			// 1. Wipe the store and local storage
			store.reset();
			checkoutStore.clearCheckoutSessionUuid();

			// 2. Redirect back to catalogue to refresh view
			const eventSlug = params.slug as string;
			if (eventSlug) {
				router.push(`/events/${eventSlug}/seat-reservations` as Route);
			} else {
				router.push("/events" as Route);
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Checkout failed";
			toast.error(message);
		} finally {
			store.setProcessing(false);
		}
	};

	return {
		checkout,
		isProcessing: store.isProcessing,
	};
}
