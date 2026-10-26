"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type GiftPlan,
	getBatchSize,
	planGiftTargets,
	seededRandom,
} from "@/components/pages/surprise-mechanics/lucky-draw/batch-draw";
import { getEventById } from "@/lib/api/event";
import {
	type AddInvalidParticipantRequest,
	type CreateGiftRequest,
	type GetParticipantsQuery,
	getGifts,
	getInvalidParticipants,
	getLuckyDrawSession,
	getParticipants,
	type UpdateGiftRequest,
	type UpdateLuckyDrawSessionRequest,
} from "@/lib/api/lucky-draw";
import {
	transformGift,
	transformInvalidParticipant,
	transformParticipant,
	transformParticipantToAPI,
} from "@/lib/api/lucky-draw/transform";
import {
	type DrawStyle,
	type Gift,
	type Participant,
	useLuckyDrawStore,
} from "@/stores/lucky-draw-store";
import {
	useAddInvalidParticipant,
	useAssignWinner,
	useBulkAddInvalidParticipants,
	useBulkAssignWinners,
	useClearInvalidParticipants,
	useClearWinner,
	useCreateGift,
	useDeleteGift,
	useRemoveInvalidParticipant,
	useSweepAssignWinners,
	useUpdateGift,
	useUpdateLuckyDrawSession,
	useUpdateSessionBackground,
} from "./use-lucky-draw-queries";

const randomSeed = () => Math.floor(Math.random() * 2 ** 32);

/**
 * Unified Lucky Draw Hook
 *
 * This hook encapsulates ALL lucky draw logic:
 * - Fetches all data via TanStack Query (config, gifts, participants, invalidParticipants)
 * - Provides all mutations
 * - Manages UI state via Zustand (isDrawing only)
 * - Returns transformed data ready for components
 *
 * Components should consume data from this hook directly, NOT from Zustand store
 */
export function useLuckyDraw(
	eventId: string,
	sessionId: number,
	eventName?: string,
) {
	// ========================================
	// UI State (Zustand) - For drawing state only
	// ========================================
	const store = useLuckyDrawStore();
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
		queryKey: ["lucky-draw-session", eventId, sessionId],
		queryFn: () => getLuckyDrawSession(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	const drawStyle = (sessionData?.draw_styles?.style as DrawStyle) || "wheel";
	const drawTheme =
		(sessionData?.draw_styles?.theme as "wireframe" | "colorful" | "cartoon") ||
		"wireframe";
	const useGifts = sessionData?.use_gifts ?? false;
	const wrapperBackground = sessionData?.wrapper_background || {
		useImage: false,
		backgroundImgUrl: undefined,
		backgroundColor: undefined,
	};

	// Fetch gifts
	const {
		data: giftsData,
		isLoading: isLoadingGifts,
		isError: isErrorGifts,
	} = useQuery({
		queryKey: ["lucky-draw", "gifts", eventId, sessionId],
		queryFn: () => getGifts(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	// Fetch participants
	// Backend handles exclusion based on use_gifts config:
	// - When use_gifts is true: excludes winners (gift_winners) only
	// - When use_gifts is false: excludes invalid participants only
	const participantQuery: GetParticipantsQuery = {};

	const {
		data: participantsData,
		isLoading: isLoadingParticipants,
		isError: isErrorParticipants,
	} = useQuery({
		queryKey: [
			"lucky-draw",
			"participants",
			eventId,
			sessionId,
			participantQuery,
		],
		queryFn: () => getParticipants(eventId, sessionId, participantQuery),
		enabled: !!eventId && !!sessionId,
	});

	// Fetch invalid participants
	const {
		data: invalidParticipantsData,
		isLoading: isLoadingInvalidParticipants,
		isError: isErrorInvalidParticipants,
	} = useQuery({
		queryKey: ["lucky-draw", "invalid-participants", eventId, sessionId],
		queryFn: () => getInvalidParticipants(eventId, sessionId),
		enabled: !!eventId && !!sessionId,
	});

	// ========================================
	// Transformed Data - Memoized for performance
	// ========================================

	// Create participants map for gift winner name lookup
	const participantsMap = useMemo(() => {
		const map = new Map();
		if (participantsData) {
			for (const p of participantsData) {
				map.set(p.id, p);
			}
		}
		return map;
	}, [participantsData]);

	// Transform participants
	const participants = useMemo<Participant[]>(() => {
		if (!participantsData || useTicket === undefined) {
			return [];
		}
		return participantsData.map((p) => transformParticipant(p, useTicket));
	}, [participantsData, useTicket]);

	// Transform gifts (filter out gifts with 0 winner_counts)
	const gifts = useMemo<Gift[]>(() => {
		if (!giftsData || useTicket === undefined) {
			return [];
		}
		return giftsData
			.filter((g) => g.winner_counts > 0)
			.map((g) => transformGift(g, useTicket, participantsMap));
	}, [giftsData, useTicket, participantsMap]);

	// Transform invalid participants
	const invalidParticipants = useMemo<Participant[]>(() => {
		if (!invalidParticipantsData || useTicket === undefined) {
			return [];
		}
		return invalidParticipantsData.map((ip) =>
			transformInvalidParticipant(ip, useTicket),
		);
	}, [invalidParticipantsData, useTicket]);

	// Get available participants for drawing
	// Backend already handles exclusion based on use_gifts config:
	// - When use_gifts is true: backend excludes winners (gift_winners), so participants are already filtered
	// - When use_gifts is false: backend excludes invalid participants, so participants are already filtered
	const availableParticipants = useMemo<Participant[]>(() => {
		return participants;
	}, [participants]);

	// Which gift each winner of the next click goes to (see planGiftTargets).
	// The seed changes after every saved draw, so random mode re-rolls the gift
	// but keeps it steady while the screen re-renders.
	const winnersPerDraw = sessionData?.winners_per_draw ?? 1;
	const giftPick = sessionData?.gift_pick ?? "in_order";
	const roundSweep = useGifts && (sessionData?.round_sweep ?? false);
	const [giftSeed, setGiftSeed] = useState(randomSeed);
	const rerollGift = useCallback(() => setGiftSeed(randomSeed()), []);

	const giftPlan = useMemo<GiftPlan>(
		() =>
			useGifts
				? planGiftTargets({
						gifts,
						giftPick,
						roundSweep,
						winnersPerDraw,
						available: availableParticipants.length,
						random: seededRandom(giftSeed),
					})
				: { gift: null, targets: [] },
		[
			useGifts,
			gifts,
			giftPick,
			roundSweep,
			winnersPerDraw,
			availableParticipants.length,
			giftSeed,
		],
	);
	const nextAvailableGift = giftPlan.gift;
	const giftTargets = giftPlan.targets;

	// Multi-winner draw: one click picks `batchSize` winners (1 = classic draw).
	// A round sweep always runs as one, even when only one gift is open.
	const isBatchDraw = roundSweep || winnersPerDraw > 1;
	const batchSize = useGifts
		? giftTargets.length
		: getBatchSize({
				winnersPerDraw,
				available: availableParticipants.length,
				giftSlotsLeft: null,
			});

	// Round number the next sweep will get (the server numbers it the same way)
	const nextRound = useMemo(
		() =>
			gifts.reduce(
				(max, gift) =>
					Math.max(max, ...(gift.allWinners ?? []).map((w) => w.round ?? 0)),
				0,
			) + 1,
		[gifts],
	);

	// Can draw check
	const canDraw = useMemo<boolean>(() => {
		const hasParticipants = availableParticipants.length > 0;
		const hasAvailableGifts = useGifts
			? gifts.length > 0 && nextAvailableGift !== null
			: true;

		return (
			hasParticipants &&
			hasAvailableGifts &&
			!isDrawing &&
			!isLoadingConfig &&
			!isLoadingGifts &&
			!isLoadingParticipants &&
			!isLoadingEvent
		);
	}, [
		availableParticipants.length,
		useGifts,
		gifts.length,
		nextAvailableGift,
		isDrawing,
		isLoadingConfig,
		isLoadingGifts,
		isLoadingParticipants,
		isLoadingEvent,
	]);

	// ========================================
	// Mutations - All API operations
	// ========================================

	const updateConfigMutation = useUpdateLuckyDrawSession(eventId, sessionId);
	const updateSessionBackgroundMutation = useUpdateSessionBackground(
		eventId,
		sessionId,
	);
	const createGiftMutation = useCreateGift(eventId, sessionId);
	const updateGiftMutation = useUpdateGift(eventId, sessionId);
	const deleteGiftMutation = useDeleteGift(eventId, sessionId);
	const assignWinnerMutation = useAssignWinner(eventId, sessionId);
	const clearWinnerMutation = useClearWinner(eventId, sessionId);
	const addInvalidParticipantMutation = useAddInvalidParticipant(
		eventId,
		sessionId,
	);
	const bulkAssignWinnersMutation = useBulkAssignWinners(eventId, sessionId);
	const sweepAssignWinnersMutation = useSweepAssignWinners(eventId, sessionId);
	const bulkAddInvalidParticipantsMutation = useBulkAddInvalidParticipants(
		eventId,
		sessionId,
	);
	const removeInvalidParticipantMutation = useRemoveInvalidParticipant(
		eventId,
		sessionId,
	);
	const clearInvalidParticipantsMutation = useClearInvalidParticipants(
		eventId,
		sessionId,
	);

	// ========================================
	// Actions - Wrapped mutations with toast
	// ========================================

	const addGift = useCallback(
		async (giftName: string, winnerCounts?: number, drawLast?: boolean) => {
			try {
				const payload: CreateGiftRequest = {
					name: giftName,
					winner_counts: winnerCounts,
					draw_last: drawLast,
				};
				await createGiftMutation.mutateAsync(payload);
				toast.success("Gift added successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to add gift",
				);
			}
		},
		[createGiftMutation],
	);

	const updateGift = useCallback(
		async (giftId: string, data: UpdateGiftRequest) => {
			try {
				const giftIdNum = Number.parseInt(giftId, 10);
				await updateGiftMutation.mutateAsync({
					giftId: giftIdNum,
					data,
				});
				toast.success("Gift updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update gift",
				);
			}
		},
		[updateGiftMutation],
	);

	const removeGift = useCallback(
		async (giftId: string) => {
			try {
				const giftIdNum = Number.parseInt(giftId, 10);
				await deleteGiftMutation.mutateAsync(giftIdNum);
				toast.success("Gift removed successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to remove gift",
				);
			}
		},
		[deleteGiftMutation],
	);

	const reorderGifts = useCallback(
		async (giftUpdates: Array<{ id: string; order: number }>) => {
			try {
				// Update each gift's order via API
				const updates = giftUpdates.map((gift) => ({
					giftId: Number.parseInt(gift.id, 10),
					order: gift.order,
				}));
				await Promise.all(
					updates.map(({ giftId, order }) =>
						updateGiftMutation.mutateAsync({ giftId, data: { order } }),
					),
				);
				toast.success("Gifts reordered successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to reorder gifts",
				);
			}
		},
		[updateGiftMutation],
	);

	const assignWinner = useCallback(
		async (giftId: string, winner: Participant, useTicket: boolean) => {
			try {
				const giftIdNum = Number.parseInt(giftId, 10);
				const request = transformParticipantToAPI(winner, useTicket);

				await assignWinnerMutation.mutateAsync({
					giftId: giftIdNum,
					data: request,
				});
				rerollGift();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to assign winner",
				);
			}
		},
		[assignWinnerMutation, rerollGift],
	);

	const clearWinner = useCallback(
		async (giftId: string, winnerId: number) => {
			try {
				const giftIdNum = Number.parseInt(giftId, 10);
				await clearWinnerMutation.mutateAsync({
					giftId: giftIdNum,
					winnerId,
				});
				toast.success("Winner cleared successfully");
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to clear winner",
				);
			}
		},
		[clearWinnerMutation],
	);

	const setDrawStyle = useCallback(
		async (style: DrawStyle, theme?: "wireframe" | "colorful" | "cartoon") => {
			try {
				const currentTheme = theme || drawTheme;
				const payload: UpdateLuckyDrawSessionRequest = {
					draw_styles: { style, theme: currentTheme },
				};
				await updateConfigMutation.mutateAsync(payload);
				toast.success("Draw style updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update draw style",
				);
			}
		},
		[updateConfigMutation, drawTheme],
	);

	const setDrawTheme = useCallback(
		async (theme: "wireframe" | "colorful" | "cartoon") => {
			try {
				const payload: UpdateLuckyDrawSessionRequest = {
					draw_styles: { style: drawStyle, theme },
				};
				await updateConfigMutation.mutateAsync(payload);
				toast.success("Draw theme updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update draw theme",
				);
			}
		},
		[updateConfigMutation, drawStyle],
	);

	const setUseGifts = useCallback(
		async (value: boolean) => {
			try {
				const payload: UpdateLuckyDrawSessionRequest = { use_gifts: value };
				await updateConfigMutation.mutateAsync(payload);
				toast.success("Gift settings updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update gift settings",
				);
			}
		},
		[updateConfigMutation],
	);

	// Draw behavior settings, saved together in one request
	const setDrawOptions = useCallback(
		async (
			options: Pick<
				UpdateLuckyDrawSessionRequest,
				"winners_per_draw" | "gift_pick" | "round_sweep"
			>,
		) => {
			try {
				await updateConfigMutation.mutateAsync(options);
				toast.success("Draw options updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update draw options",
				);
			}
		},
		[updateConfigMutation],
	);

	const setWrapperBackground = useCallback(
		async (value: {
			useImage: boolean;
			backgroundImage?: File;
			backgroundColor?: string;
		}) => {
			try {
				await updateSessionBackgroundMutation.mutateAsync({
					useImage: value.useImage,
					backgroundImage: value.backgroundImage,
					backgroundColor: value.backgroundColor,
				});
				toast.success("Background settings updated successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to update background settings",
				);
			}
		},
		[updateSessionBackgroundMutation],
	);

	const addInvalidParticipant = useCallback(
		async (participant: Participant, useTicket: boolean) => {
			try {
				const request: AddInvalidParticipantRequest = transformParticipantToAPI(
					participant,
					useTicket,
				);
				await addInvalidParticipantMutation.mutateAsync(request);
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to add invalid participant",
				);
			}
		},
		[addInvalidParticipantMutation],
	);

	// Multi-winner saves: all-or-nothing on the server. Return whether it
	// worked so the caller only reveals winners that were actually stored.
	const assignWinners = useCallback(
		async (giftId: string, winners: Participant[], useTicket: boolean) => {
			try {
				await bulkAssignWinnersMutation.mutateAsync({
					giftId: Number.parseInt(giftId, 10),
					data: {
						winners: winners.map((w) =>
							transformParticipantToAPI(w, useTicket),
						),
					},
				});
				rerollGift();
				return true;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to assign winners",
				);
				return false;
			}
		},
		[bulkAssignWinnersMutation, rerollGift],
	);

	// One draw round: each winner is saved for its own gift, all or nothing.
	const assignSweep = useCallback(
		async (
			picks: Array<{ gift: Gift; winner: Participant }>,
			useTicket: boolean,
		) => {
			try {
				await sweepAssignWinnersMutation.mutateAsync({
					winners: picks.map(({ gift, winner }) => ({
						gift_id: Number.parseInt(gift.id, 10),
						...transformParticipantToAPI(winner, useTicket),
					})),
				});
				rerollGift();
				return true;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to assign winners",
				);
				return false;
			}
		},
		[sweepAssignWinnersMutation, rerollGift],
	);

	const addInvalidParticipants = useCallback(
		async (winners: Participant[], useTicket: boolean) => {
			try {
				await bulkAddInvalidParticipantsMutation.mutateAsync({
					winners: winners.map((w) => transformParticipantToAPI(w, useTicket)),
				});
				return true;
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to save winners",
				);
				return false;
			}
		},
		[bulkAddInvalidParticipantsMutation],
	);

	const removeInvalidParticipant = useCallback(
		async (invalidParticipantId: number) => {
			try {
				await removeInvalidParticipantMutation.mutateAsync(
					invalidParticipantId,
				);
				toast.success("Invalid participant removed");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to remove invalid participant",
				);
			}
		},
		[removeInvalidParticipantMutation],
	);

	const clearInvalidParticipants = useCallback(async () => {
		try {
			await clearInvalidParticipantsMutation.mutateAsync();
			toast.success("All invalid participants cleared");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to clear invalid participants",
			);
		}
	}, [clearInvalidParticipantsMutation]);

	const startDrawing = useCallback(() => {
		store.setDrawingState(true);
	}, [store]);

	const stopDrawing = useCallback(() => {
		store.setDrawingState(false);
	}, [store]);

	const resetDraw = useCallback(() => {
		store.setEventId(eventId);
		store.setSessionId(sessionId);
		store.setDrawingState(false);
	}, [store, eventId, sessionId]);

	// ========================================
	// Return everything components need
	// ========================================

	return {
		// Data - Source of truth from TanStack Query
		participants,
		gifts,
		invalidParticipants,
		availableParticipants,
		nextAvailableGift,
		drawStyle,
		drawTheme,
		useGifts,
		wrapperBackground,
		useTicket,
		canDraw,
		winnersPerDraw,
		batchSize,
		giftTargets,
		isBatchDraw,
		roundSweep,
		giftPick,
		// The saved setting, unlike roundSweep which is also off when gifts are off
		roundSweepSetting: sessionData?.round_sweep ?? false,
		nextRound,

		// Raw data for advanced use cases
		giftsData,
		participantsData,
		invalidParticipantsData,
		participantsMap,

		// UI State
		isDrawing,
		eventId: store.eventId,
		sessionId: store.sessionId,
		eventName: store.eventName,

		// Loading states
		isLoadingEvent,
		isLoadingConfig,
		isLoadingGifts,
		isLoadingParticipants,
		isLoadingInvalidParticipants,

		// Error states
		isErrorEvent,
		isErrorConfig,
		isErrorGifts,
		isErrorParticipants,
		isErrorInvalidParticipants,

		// Actions
		addGift,
		updateGift,
		removeGift,
		reorderGifts,
		assignWinner,
		clearWinner,
		setDrawStyle,
		setDrawTheme,
		setUseGifts,
		setDrawOptions,
		setWrapperBackground,
		startDrawing,
		stopDrawing,
		resetDraw,
		addInvalidParticipant,
		assignWinners,
		assignSweep,
		addInvalidParticipants,
		removeInvalidParticipant,
		clearInvalidParticipants,
	};
}
