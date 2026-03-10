import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
	getPublicSectionSeats,
	lockSeat,
	unlockSeat,
} from "@/lib/api/seat-ticketing/endpoints";
import { usePublicSeatStore } from "../stores/public-seat-store";
import { useSeatCheckoutStore } from "../stores/seat-checkout-store";

export const usePublicSeatSelectedState = () => {
	const { selectedSeats, sections } = usePublicSeatStore(
		useShallow((state) => ({
			selectedSeats: state.selectedSeats,
			sections: state.sections,
		})),
	);

	const selectedSeatIds = useMemo(
		() => new Set(Object.keys(selectedSeats).map(Number)),
		[selectedSeats],
	);

	const totalPrice = useMemo(() => {
		let total = 0;
		for (const seat of Object.values(selectedSeats)) {
			const section = sections[seat.event_seat_section_id];
			total += Number(section?.price || 0) + Number(seat.extra_price || 0);
		}
		return total;
	}, [selectedSeats, sections]);

	return {
		selectedSeats,
		selectedSeatIds,
		totalPrice,
	};
};

export const usePublicSeatSelectionMap = () =>
	usePublicSeatStore((state) => state.selectedSeats);

export const usePublicSeatSectionState = () =>
	usePublicSeatStore(
		useShallow((state) => ({
			sections: state.sections,
			activeSectionId: state.activeSectionId,
			setActiveSection: state.setActiveSection,
		})),
	);

export const usePublicSeatHydrationState = () =>
	usePublicSeatStore(
		useShallow((state) => ({
			seats: state.seats,
			hydratingSectionIds: state.hydratingSectionIds,
			hydratedSectionIds: state.hydratedSectionIds,
			error: state.error,
		})),
	);

export const usePublicSeatLifecycleState = () =>
	usePublicSeatStore(
		useShallow((state) => ({
			expiresAt: state.expiresAt,
			reset: state.reset,
		})),
	);

export const usePublicSeatActions = () => {
	const toggleSeatAction = usePublicSeatStore((state) => state.toggleSeat);
	const hydrateSectionAction = usePublicSeatStore(
		(state) => state.hydrateSection,
	);
	const checkoutSessionUuid = useSeatCheckoutStore(
		(state) => state.checkoutSessionUuid,
	);

	const toggleSeat = useCallback(
		async (seatId: number) => {
			const store = usePublicSeatStore.getState();
			const activeCheckoutSessionUuid =
				useSeatCheckoutStore.getState().checkoutSessionUuid;
			if (!store.session || !activeCheckoutSessionUuid) return;

			const seat = store.seats[seatId] || store.selectedSeats[seatId];
			if (!seat) return;

			const section = store.sections[seat.event_seat_section_id];
			if (!section) return;

			const payload = {
				sessionId: store.session.id.toString(),
				venueId: section.event_seat_venue_id.toString(),
				sectionId: seat.event_seat_section_id.toString(),
				seatId: seatId.toString(),
				checkout_session_uuid: activeCheckoutSessionUuid,
			};

			return toggleSeatAction(
				seatId,
				() => lockSeat(payload),
				() => unlockSeat(payload),
			);
		},
		[toggleSeatAction],
	);

	const hydrateSection = useCallback(
		async (sectionId: number) => {
			const store = usePublicSeatStore.getState();
			if (!store.session) return;
			const sessionId = store.session.id.toString();

			return hydrateSectionAction(sectionId, (id) =>
				getPublicSectionSeats({
					sessionId,
					sectionId: id.toString(),
				}),
			);
		},
		[hydrateSectionAction],
	);

	return {
		toggleSeat,
		hydrateSection,
		checkoutSessionUuid,
	};
};

export const usePublicSeatReservation = () => {
	const sectionState = usePublicSeatSectionState();
	const hydrationState = usePublicSeatHydrationState();
	const selectedState = usePublicSeatSelectedState();
	const lifecycleState = usePublicSeatLifecycleState();
	const actions = usePublicSeatActions();
	const isWarning = usePublicSeatStore((state) => state.isWarning);
	const isProcessing = usePublicSeatStore((state) => state.isProcessing);

	return {
		...sectionState,
		...hydrationState,
		...selectedState,
		...lifecycleState,
		...actions,
		isWarning,
		isProcessing,
	};
};
