"use client";

import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import {
	checkoutSession,
	checkoutSessionHeartbeat,
	lockSeat,
	unlockSeat,
} from "@/lib/api/seat-ticketing/endpoints";
import type {
	EventSeatSession,
	EventTicketSeat,
} from "@/lib/api/seat-ticketing/response";
import { cable } from "@/lib/cable";
import { useSeatCheckoutSessionStore } from "@/stores/seat-checkout-session-store";

interface VisitorData {
	full_name: string;
	email: string;
	phone: string;
}

interface SeatReservationContextType {
	session: EventSeatSession | null;
	selectedSeats: Map<number, EventTicketSeat>;
	processingSeats: Set<number>;
	toggleSeat: (
		venueId: number,
		sectionId: number,
		seat: EventTicketSeat,
	) => Promise<void>;
	checkout: (visitorData: VisitorData, ticketTypeId?: number) => Promise<void>;
	isProcessing: boolean;
	totalPrice: number;
}

const SeatReservationContext = createContext<
	SeatReservationContextType | undefined
>(undefined);

export function SeatReservationSessionProvider({
	children,
	initialSession,
}: {
	children: ReactNode;
	initialSession: EventSeatSession;
}) {
	const [session, setSession] = useState<EventSeatSession>(initialSession);
	const [processingSeats, setProcessingSeats] = useState<Set<number>>(new Set());
	const [isProcessing, setIsProcessing] = useState(false);

	const checkoutSessionUuid = useSeatCheckoutSessionStore(
		(state) => state.checkoutSessionUuid,
	);
	const hasHydrated = useSeatCheckoutSessionStore((state) => state.hasHydrated);
	const setCheckoutSessionUuid = useSeatCheckoutSessionStore(
		(state) => state.setCheckoutSessionUuid,
	);
	const clearCheckoutSessionUuid = useSeatCheckoutSessionStore(
		(state) => state.clearCheckoutSessionUuid,
	);

	// Manually trigger hydration on mount
	useEffect(() => {
		useSeatCheckoutSessionStore.persist.rehydrate();
	}, []);

	// Derive selectedSeats from session based on my UUID
	const selectedSeats = useMemo(() => {
		const myLockedSeats = new Map<number, EventTicketSeat>();
		if (!checkoutSessionUuid) return myLockedSeats;

		for (const venue of session.event_seat_venues ?? []) {
			for (const section of venue.event_seat_sections ?? []) {
				for (const seat of section.event_ticket_seats ?? []) {
					if (
						seat.status === "locked" &&
						seat.locked_by_session_id === checkoutSessionUuid
					) {
						myLockedSeats.set(seat.id, seat);
					}
				}
			}
		}
		return myLockedSeats;
	}, [session, checkoutSessionUuid]);

	useEffect(() => {
		if (!hasHydrated) return;
		if (!checkoutSessionUuid) {
			setCheckoutSessionUuid(crypto.randomUUID());
		}
	}, [hasHydrated, checkoutSessionUuid, setCheckoutSessionUuid]);

	useEffect(() => {
		if (!hasHydrated) return;
		if (checkoutSessionUuid) return;
		setProcessingSeats(new Set());
	}, [hasHydrated, checkoutSessionUuid]);

	// Heartbeat to keep locks alive
	useEffect(() => {
		if (!hasHydrated || !checkoutSessionUuid || selectedSeats.size === 0) return;

		const interval = setInterval(async () => {
			try {
				const response = await checkoutSessionHeartbeat({
					checkoutSessionUuid,
				});
				// Update expiration in local storage for the banner
				localStorage.setItem(
					`seat-checkout-expires-at:${checkoutSessionUuid}`,
					response.expires_at,
				);
			} catch (error) {
				console.error("Heartbeat failed", error);
			}
		}, 60000); // Every 60 seconds

		return () => clearInterval(interval);
	}, [hasHydrated, checkoutSessionUuid, selectedSeats.size]);

	// Real-time updates via ActionCable
	useEffect(() => {
		if (!hasHydrated || !session?.public_id || !checkoutSessionUuid) return;

		const channel = cable.subscriptions.create(
			{ channel: "EventSeatSessionChannel", session_id: session.public_id },
			{
				received: (data: {
					type: string;
					seat: EventTicketSeat & { status: string };
				}) => {
					if (data.type === "seat_updated") {
						setSession((prev) => {
							const next = { ...prev };
							// Deep update the seat in the nested structure
							next.event_seat_venues = next.event_seat_venues?.map((venue) => ({
								...venue,
								event_seat_sections: venue.event_seat_sections?.map(
									(section) => {
										if (section.id === data.seat.event_seat_section_id) {
											return {
												...section,
												event_ticket_seats: section.event_ticket_seats?.map(
													(seat) =>
														seat.id === data.seat.id ? data.seat : seat,
												),
											};
										}
										return section;
									},
								),
							}));
							return next;
						});

						// If the seat was updated, it's no longer "processing" locally
						setProcessingSeats((prev) => {
							if (prev.has(data.seat.id)) {
								const next = new Set(prev);
								next.delete(data.seat.id);
								return next;
							}
							return prev;
						});
					}
				},
			},
		);

		return () => {
			channel.unsubscribe();
		};
	}, [hasHydrated, session.public_id, checkoutSessionUuid]);

	const toggleSeat = useCallback(
		async (venueId: number, sectionId: number, seat: EventTicketSeat) => {
			if (isProcessing || processingSeats.has(seat.id)) return;
			if (!checkoutSessionUuid) {
				toast.error("Unable to start a checkout session. Please refresh.");
				return;
			}

			const isSelected = selectedSeats.has(seat.id);

			// If not selected, check if it's actually available to be locked
			if (!isSelected && seat.status !== "available") {
				return;
			}

			setProcessingSeats((prev) => new Set(prev).add(seat.id));

			const sessionId = session.id.toString();

			try {
				if (isSelected) {
					await unlockSeat({
						sessionId,
						venueId: venueId.toString(),
						sectionId: sectionId.toString(),
						seatId: seat.id.toString(),
						checkout_session_uuid: checkoutSessionUuid,
					});
					// Note: We no longer manually update selectedSeats Map here
					// ActionCable or the state update from the API will trigger a re-render
					// and derivation will handle the rest.
				} else {
					// Lock
					await lockSeat({
						sessionId,
						venueId: venueId.toString(),
						sectionId: sectionId.toString(),
						seatId: seat.id.toString(),
						checkout_session_uuid: checkoutSessionUuid,
					});
				}
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: "Failed to update seat selection";
				toast.error(message);
				// Clean up processing if error
				setProcessingSeats((prev) => {
					const next = new Set(prev);
					next.delete(seat.id);
					return next;
				});
			}
		},
		[
			selectedSeats,
			session.id,
			isProcessing,
			processingSeats,
			checkoutSessionUuid,
		],
	);

	const checkout = useCallback(
		async (visitorData: VisitorData, ticketTypeId?: number) => {
			if (selectedSeats.size === 0) {
				toast.error("Please select at least one seat");
				return;
			}
			if (!checkoutSessionUuid) {
				toast.error("Unable to start a checkout session. Please refresh.");
				return;
			}

			setIsProcessing(true);
			try {
				await checkoutSession({
					sessionId: session.id.toString(),
					seat_ids: Array.from(selectedSeats.keys()),
					visitor: visitorData,
					checkout_session_uuid: checkoutSessionUuid,
					ticket_type_id: ticketTypeId,
				});
				toast.success("Reservation successful!");
				localStorage.removeItem(
					`seat-checkout-expires-at:${checkoutSessionUuid}`,
				);
				clearCheckoutSessionUuid();
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Checkout failed";
				toast.error(message);
			} finally {
				setIsProcessing(false);
			}
		},
		[
			selectedSeats,
			session.id,
			checkoutSessionUuid,
			clearCheckoutSessionUuid,
		],
	);

	const totalPrice = useMemo(() => {
		// Create a map of sections for O(1) lookup
		const sectionMap = new Map();
		for (const venue of session.event_seat_venues ?? []) {
			for (const section of venue.event_seat_sections ?? []) {
				sectionMap.set(section.id, section);
			}
		}

		let total = 0;
		for (const seat of Array.from(selectedSeats.values())) {
			const section = sectionMap.get(seat.event_seat_section_id);
			const basePrice = Number.parseFloat(String(section?.price || 0));
			const extraPrice = Number.parseFloat(String(seat.extra_price || 0));
			total += basePrice + extraPrice;
		}
		return total;
	}, [selectedSeats, session]);

	if (!hasHydrated) {
		return null; // Or a loader
	}

	return (
		<SeatReservationContext.Provider
			value={{
				session,
				selectedSeats,
				processingSeats,
				toggleSeat,
				checkout,
				isProcessing,
				totalPrice,
			}}
		>
			{children}
		</SeatReservationContext.Provider>
	);
}

export const useSeatReservation = () => {
	const context = useContext(SeatReservationContext);
	if (!context)
		throw new Error(
			"useSeatReservation must be used within a SeatReservationSessionProvider",
		);
	return context;
};
