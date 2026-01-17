"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { Prize } from "@/components/pages/surprise-mechanics/shared/draw-styles/type";
import { getEventById } from "@/lib/api/event";
import {
	getRoulettePrizes,
	getRouletteSession,
	getRouletteWinners,
} from "@/lib/api/roulette";
import type { RouletteParticipant } from "@/lib/api/roulette/response";
import { usePrizeRouletteStore } from "@/stores/prize-roulette-store";
import { useCreateRouletteWinner } from "./use-prize-roulette-queries";

/**
 * Unified Prize Roulette Hook
 *
 * This hook encapsulates ALL prize roulette logic:
 * - Fetches all data via TanStack Query (config, prizes, winners)
 * - Provides all mutations
 * - Manages UI state via Zustand (isDrawing only)
 * - Returns transformed data ready for components
 *
 * Components should consume data from this hook directly, NOT from Zustand store
 */
export function usePrizeRoulette(
	eventId: string,
	sessionId: number,
	eventName?: string,
) {
	// ========================================
	// UI State (Zustand) - For drawing state only
	// ========================================
	const store = usePrizeRouletteStore();
	const isDrawing = store.isDrawing;

	// Initialize event ID and name if not set
	if (store.eventId !== eventId) {
		store.setEventId(eventId);
	}
	if (store.sessionId !== sessionId) {
		store.setSessionId(sessionId);
	}
	if (eventName && store.eventName !== eventName) {
		store.setEventName(eventName);
	}

	// ========================================
	// Queries - Source of truth for ALL data
	// ========================================

	// Fetch event to get use_ticket flag
	const {
		data: event,
		isLoading: isLoadingEvent,
		isError: isErrorEvent,
	} = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId),
		enabled: !!eventId,
		retry: 2,
		retryDelay: 1000,
	});

	const useTicket = event?.use_ticket ?? true;

	// Fetch config (session)
	const {
		data: sessionData,
		isLoading: isLoadingConfig,
		isError: isErrorConfig,
	} = useQuery({
		queryKey: ["roulette-session", eventId, sessionId],
		queryFn: () => getRouletteSession(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	// Fetch prizes
	const {
		data: prizesData,
		isLoading: isLoadingPrizes,
		isError: isErrorPrizes,
	} = useQuery({
		queryKey: ["roulette-prizes", eventId, sessionId],
		queryFn: () => getRoulettePrizes(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	// Fetch winners
	const {
		data: winnersData,
		isLoading: isLoadingWinners,
		isError: isErrorWinners,
	} = useQuery({
		queryKey: ["roulette-winners", eventId, sessionId],
		queryFn: () => getRouletteWinners(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	// ========================================
	// Computed Data - Memoized for performance
	// ========================================

	// Calculate remaining quantity for each prize
	const prizesWithRemaining = useMemo(() => {
		if (!prizesData || !winnersData) return [];
		return prizesData.map((prize) => {
			const prizeWinners = winnersData.filter(
				(w) => w.roulette_prize_id === prize.id,
			);
			const remaining = prize.quantity - prizeWinners.length;
			return { ...prize, remaining, hasWinner: prizeWinners.length > 0 };
		});
	}, [prizesData, winnersData]);

	// Get available prizes (those with remaining > 0)
	const availablePrizes = useMemo<Prize[]>(() => {
		return prizesWithRemaining
			.filter((prize) => prize.remaining > 0)
			.map((prize) => ({
				id: prize.id,
				name: prize.name,
				quantity: prize.quantity,
				remaining: prize.remaining,
				image_url: prize.image_url,
			}));
	}, [prizesWithRemaining]);

	// Can draw check
	const canDraw = useMemo<boolean>(() => {
		return (
			availablePrizes.length > 0 &&
			!isDrawing &&
			!isLoadingConfig &&
			!isLoadingPrizes &&
			!isLoadingWinners &&
			!isLoadingEvent
		);
	}, [
		availablePrizes.length,
		isDrawing,
		isLoadingConfig,
		isLoadingPrizes,
		isLoadingWinners,
		isLoadingEvent,
	]);

	// ========================================
	// Mutations - All API operations
	// ========================================

	const createWinnerMutation = useCreateRouletteWinner(eventId, sessionId);

	// ========================================
	// Actions - Wrapped mutations with toast
	// ========================================

	const startDrawing = useCallback(() => {
		store.setDrawingState(true);
	}, [store]);

	const stopDrawing = useCallback(() => {
		store.setDrawingState(false);
	}, [store]);

	const createWinner = useCallback(
		async (participant: RouletteParticipant, prize: Prize) => {
			try {
				const winnerData: {
					prize_id: number;
					ticket_public_id?: string;
					visitor_public_id?: string;
				} = {
					prize_id: prize.id,
				};

				if (participant.type === "ticket") {
					winnerData.ticket_public_id = participant.publicId;
				} else {
					winnerData.visitor_public_id = participant.publicId;
				}

				await createWinnerMutation.mutateAsync(winnerData);
				toast.success("Winner created successfully!");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to create winner",
				);
				throw error;
			}
		},
		[createWinnerMutation],
	);

	// ========================================
	// Return everything components need
	// ========================================

	return {
		// Data - Source of truth from TanStack Query
		session: sessionData,
		prizes: prizesData || [],
		winners: winnersData || [],
		prizesWithRemaining,
		availablePrizes,
		drawStyle:
			(sessionData?.draw_styles?.style as "wheel" | "slot" | "box") || "wheel",
		drawTheme:
			(sessionData?.draw_styles?.theme as
				| "wireframe"
				| "colorful"
				| "cartoon") || "wireframe",
		wrapperBackground: sessionData?.wrapper_background || {
			useImage: false,
			backgroundImgUrl: undefined,
			backgroundColor: undefined,
		},
		useTicket,
		canDraw,

		// UI State
		isDrawing,

		// Loading states
		isLoadingEvent,
		isLoadingConfig,
		isLoadingPrizes,
		isLoadingWinners,

		// Error states
		isErrorEvent,
		isErrorConfig,
		isErrorPrizes,
		isErrorWinners,

		// Actions
		startDrawing,
		stopDrawing,
		createWinner,
	};
}
