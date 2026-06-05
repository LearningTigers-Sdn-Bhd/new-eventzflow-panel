import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRouletteWinnerRequest } from "@/lib/api/roulette";
import { createRouletteWinner } from "@/lib/api/roulette";

/**
 * Prize Roulette Mutation Hooks
 *
 * This file contains ONLY mutation hooks for prize roulette.
 * Query hooks are integrated into the unified `usePrizeRoulette` hook.
 *
 * These mutation hooks are used by the unified hook to perform API operations.
 */

/**
 * Mutation Hook: Create Roulette Winner
 */
export function useCreateRouletteWinner(eventId: string, sessionId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateRouletteWinnerRequest) =>
			createRouletteWinner(eventId, sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["roulette-winners", eventId, sessionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["roulette-prizes", eventId, sessionId],
			});
		},
	});
}
