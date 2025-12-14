import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
	AddInvalidParticipantRequest,
	AssignWinnerRequest,
	BulkAssignWinnersRequest,
	CreateGiftRequest,
	UpdateGiftRequest,
	UpdateLuckyDrawSessionRequest,
} from "@/lib/api/lucky-draw";
import {
	addInvalidParticipant,
	assignWinner,
	bulkAssignWinners,
	clearInvalidParticipants,
	clearWinner,
	createGift,
	deleteGift,
	removeInvalidParticipant,
	updateGift,
	updateLuckyDrawSession,
	updateSessionBackground,
} from "@/lib/api/lucky-draw";

/**
 * Lucky Draw Mutation Hooks
 *
 * This file contains ONLY mutation hooks for lucky draw.
 * Query hooks are now integrated into the unified `useLuckyDraw` hook.
 *
 * These mutation hooks are used by the unified hook to perform API operations.
 */

/**
 * Mutation Hook: Update Lucky Draw Session
 */
export function useUpdateLuckyDrawSession(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateLuckyDrawSessionRequest) =>
			updateLuckyDrawSession(eventId, sessionId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-session", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-sessions", eventId],
			});
			// When use_gifts changes, participants list changes because:
			// - When use_gifts is true: backend excludes winners (gift_winners)
			// - When use_gifts is false: backend excludes invalid participants
			if (variables.use_gifts !== undefined) {
				queryClient.invalidateQueries({
					queryKey: ["lucky-draw", "participants", eventId, sessionId],
				});
			}
		},
	});
}

/**
 * Mutation Hook: Create Gift
 */
export function useCreateGift(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateGiftRequest) =>
			createGift(eventId, sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Update Gift
 */
export function useUpdateGift(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			giftId,
			data,
		}: {
			giftId: number;
			data: UpdateGiftRequest;
		}) => updateGift(eventId, sessionId, giftId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Delete Gift
 */
export function useDeleteGift(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (giftId: number) => deleteGift(eventId, sessionId, giftId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
			// Deleting a gift can also change which participants are eligible
			// (winners of that gift may become available again)
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Assign Winner
 * giftId is passed in the mutation function, not at hook creation
 */
export function useAssignWinner(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			giftId,
			data,
		}: {
			giftId: number;
			data: AssignWinnerRequest;
		}) => assignWinner(eventId, sessionId, giftId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Bulk Assign Winners
 * giftId is passed in the mutation function, not at hook creation
 */
export function useBulkAssignWinners(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			giftId,
			data,
		}: {
			giftId: number;
			data: BulkAssignWinnersRequest;
		}) => bulkAssignWinners(eventId, sessionId, giftId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Clear Winner
 * giftId is passed in the mutation function, not at hook creation
 */
export function useClearWinner(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ giftId, winnerId }: { giftId: number; winnerId: number }) =>
			clearWinner(eventId, sessionId, giftId, winnerId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "gifts", eventId, sessionId],
			});
			// Clearing a winner makes that participant eligible again
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Add Invalid Participant
 */
export function useAddInvalidParticipant(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AddInvalidParticipantRequest) =>
			addInvalidParticipant(eventId, sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "invalid-participants", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Remove Invalid Participant
 */
export function useRemoveInvalidParticipant(
	eventId: string,
	sessionId: number,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) =>
			removeInvalidParticipant(eventId, sessionId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "invalid-participants", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Clear Invalid Participants
 */
export function useClearInvalidParticipants(
	eventId: string,
	sessionId: number,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => clearInvalidParticipants(eventId, sessionId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "invalid-participants", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		},
	});
}

/**
 * Mutation Hook: Update Session Background
 */
export function useUpdateSessionBackground(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			useImage: boolean;
			backgroundImage?: File;
			backgroundColor?: string;
		}) => updateSessionBackground(eventId, sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw-session", eventId, sessionId],
			});
		},
	});
}
