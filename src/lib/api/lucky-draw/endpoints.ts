import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import type {
	AddInvalidParticipantRequest,
	AssignWinnerRequest,
	BulkAssignWinnersRequest,
	CreateGiftRequest,
	CreateLuckyDrawSessionRequest,
	GetParticipantsQuery,
	UpdateGiftRequest,
	UpdateLuckyDrawSessionRequest,
} from "./request";
import type {
	ApiResponse,
	Gift,
	GiftWinner,
	InvalidParticipant,
	LuckyDrawSession,
	Participant,
} from "./response";

/**
 * Get Lucky Draw Sessions
 * GET /v1/events/:event_id/lucky_draw/sessions
 */
export async function getLuckyDrawSessions(
	eventId: string,
): Promise<LuckyDrawSession[]> {
	try {
		const response = await restClient.get<
			ApiResponse<LuckyDrawSession[]>
		>(`v1/events/${eventId}/lucky_draw/sessions`);

		if (!response.success) {
			throw new Error(
				response.message || "Failed to fetch lucky draw sessions",
			);
		}

		// Return empty array if data is null/undefined, otherwise return the data array
		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get Lucky Draw Session
 * GET /v1/events/:event_id/lucky_draw/sessions/:session_id
 */
export async function getLuckyDrawSession(
	eventId: string,
	sessionId: number,
): Promise<LuckyDrawSession> {
	try {
		const response = await restClient.get<
			ApiResponse<LuckyDrawSession>
		>(`v1/events/${eventId}/lucky_draw/sessions/${sessionId}`);

		if (!response.success || !response.data) {
			throw new Error(
				response.message || "Failed to fetch lucky draw session",
			);
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Create Lucky Draw Session
 * POST /v1/events/:event_id/lucky_draw/sessions
 */
export async function createLuckyDrawSession(
	eventId: string,
	data: CreateLuckyDrawSessionRequest & { logo?: File },
): Promise<LuckyDrawSession> {
	try {
		const formData = new FormData();
		formData.append("title", data.title);
		if (data.draw_date) formData.append("draw_date", data.draw_date);
		if (data.draw_styles) {
			formData.append("draw_styles[style]", data.draw_styles.style);
			formData.append("draw_styles[theme]", data.draw_styles.theme);
		}
		if (data.use_gifts !== undefined) formData.append("use_gifts", String(data.use_gifts));
		if (data.logo) formData.append("logo", data.logo);

		const response = await restClient.postFormData<ApiResponse<LuckyDrawSession>>(
			`v1/events/${eventId}/lucky_draw/sessions`,
			formData,
		);

		if (!response.success || !response.data) {
			throw new Error(
				response.message || "Failed to create lucky draw session",
			);
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Update Lucky Draw Session
 * PATCH /v1/events/:event_id/lucky_draw/sessions/:session_id
 */
export async function updateLuckyDrawSession(
	eventId: string,
	sessionId: number,
	data: UpdateLuckyDrawSessionRequest & { logo?: File; remove_logo?: boolean },
): Promise<LuckyDrawSession> {
	try {
		const formData = new FormData();
		if (data.title) formData.append("title", data.title);
		if (data.draw_date) formData.append("draw_date", data.draw_date);
		if (data.draw_styles) {
			formData.append("draw_styles[style]", data.draw_styles.style);
			formData.append("draw_styles[theme]", data.draw_styles.theme);
		}
		if (data.use_gifts !== undefined) formData.append("use_gifts", String(data.use_gifts));
		if (data.logo) formData.append("logo", data.logo);
		if (data.remove_logo) formData.append("remove_logo", "true");

		const response = await restClient.patchFormData<ApiResponse<LuckyDrawSession>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}`,
			formData,
		);

		if (!response.success || !response.data) {
			throw new Error(
				response.message || "Failed to update lucky draw session",
			);
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Delete Lucky Draw Session
 * DELETE /v1/events/:event_id/lucky_draw/sessions/:session_id
 */
export async function deleteLuckyDrawSession(
	eventId: string,
	sessionId: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get Gifts
 * GET /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts
 */
export async function getGifts(eventId: string, sessionId: number): Promise<Gift[]> {
	try {
		const response = await restClient.get<ApiResponse<Gift[]>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts`,
		);

		if (!response.success) {
			throw new Error(response.message || "Failed to fetch gifts");
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Create Gift
 * POST /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts
 */
export async function createGift(
	eventId: string,
	sessionId: number,
	data: CreateGiftRequest,
): Promise<Gift> {
	try {
		const response = await restClient.post<ApiResponse<Gift>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts`,
			data,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to create gift");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Update Gift
 * PUT /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts/:gift_id
 */
export async function updateGift(
	eventId: string,
	sessionId: number,
	giftId: number,
	data: UpdateGiftRequest,
): Promise<Gift> {
	try {
		const response = await restClient.put<ApiResponse<Gift>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts/${giftId}`,
			data,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to update gift");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Delete Gift
 * DELETE /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts/:gift_id
 */
export async function deleteGift(
	eventId: string,
	sessionId: number,
	giftId: number,
): Promise<void> {
	try {
		await restClient.delete(`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts/${giftId}`);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Assign Winner
 * POST /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts/:gift_id/winners
 */
export async function assignWinner(
	eventId: string,
	sessionId: number,
	giftId: number,
	data: AssignWinnerRequest,
): Promise<GiftWinner> {
	try {
		const response = await restClient.post<ApiResponse<GiftWinner>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts/${giftId}/winners`,
			data,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to assign winner");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Bulk Assign Winners
 * POST /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts/:gift_id/winners/bulk
 */
export async function bulkAssignWinners(
	eventId: string,
	sessionId: number,
	giftId: number,
	data: BulkAssignWinnersRequest,
): Promise<GiftWinner[]> {
	try {
		const response = await restClient.post<ApiResponse<GiftWinner[]>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts/${giftId}/winners/bulk`,
			data,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to assign winners");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Clear Winner
 * DELETE /v1/events/:event_id/lucky_draw/sessions/:session_id/gifts/:gift_id/winners/:winner_id
 */
export async function clearWinner(
	eventId: string,
	sessionId: number,
	giftId: number,
	winnerId: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/gifts/${giftId}/winners/${winnerId}`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get Participants
 * GET /v1/events/:event_id/lucky_draw/sessions/:session_id/participants
 */
export async function getParticipants(
	eventId: string,
	sessionId: number,
	query?: GetParticipantsQuery,
): Promise<Participant[]> {
	try {
		// Build query string from query params
		const params = new URLSearchParams();
		if (query?.type) {
			params.append("type", query.type);
		}
		if (query?.exclude_winners !== undefined) {
			params.append("exclude_winners", String(query.exclude_winners));
		}
		if (query?.exclude_invalid !== undefined) {
			params.append("exclude_invalid", String(query.exclude_invalid));
		}

		const queryString = params.toString();
		const url = queryString
			? `v1/events/${eventId}/lucky_draw/sessions/${sessionId}/participants?${queryString}`
			: `v1/events/${eventId}/lucky_draw/sessions/${sessionId}/participants`;

		const response = await restClient.get<ApiResponse<Participant[]>>(url);

		if (!response.success) {
			throw new Error(response.message || "Failed to fetch participants");
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get Invalid Participants
 * GET /v1/events/:event_id/lucky_draw/sessions/:session_id/invalid_participants
 */
export async function getInvalidParticipants(
	eventId: string,
	sessionId: number,
): Promise<InvalidParticipant[]> {
	try {
		const response = await restClient.get<ApiResponse<InvalidParticipant[]>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/invalid_participants`,
		);

		if (!response.success) {
			throw new Error(
				response.message || "Failed to fetch invalid participants",
			);
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Add Invalid Participant
 * POST /v1/events/:event_id/lucky_draw/sessions/:session_id/invalid_participants
 */
export async function addInvalidParticipant(
	eventId: string,
	sessionId: number,
	data: AddInvalidParticipantRequest,
): Promise<InvalidParticipant> {
	try {
		const response = await restClient.post<ApiResponse<InvalidParticipant>>(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/invalid_participants`,
			data,
		);

		if (!response.success || !response.data) {
			throw new Error(
				response.message || "Failed to add invalid participant",
			);
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Remove Invalid Participant
 * DELETE /v1/events/:event_id/lucky_draw/sessions/:session_id/invalid_participants/:id
 */
export async function removeInvalidParticipant(
	eventId: string,
	sessionId: number,
	id: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/invalid_participants/${id}`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Clear Invalid Participants
 * DELETE /v1/events/:event_id/lucky_draw/sessions/:session_id/invalid_participants
 */
export async function clearInvalidParticipants(
	eventId: string,
	sessionId: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/lucky_draw/sessions/${sessionId}/invalid_participants`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
