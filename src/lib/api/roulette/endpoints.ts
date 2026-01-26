import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import type {
	CreateRoulettePrizeRequest,
	CreateRouletteSessionRequest,
	CreateRouletteWinnerRequest,
	UpdateRoulettePrizeRequest,
	UpdateRouletteSessionRequest,
} from "./request";
import type {
	ApiResponse,
	BackendRouletteParticipant,
	RouletteParticipant,
	RoulettePrize,
	RouletteSession,
	RouletteWinner,
} from "./response";

export async function getRouletteSessions(
	eventId: string,
): Promise<RouletteSession[]> {
	try {
		const response = await restClient.get<ApiResponse<RouletteSession[]>>(
			`v1/events/${eventId}/roulette/sessions`,
		);

		if (!response.success) {
			throw new Error(response.message || "Failed to fetch roulette sessions");
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getRouletteSession(
	eventId: string,
	sessionId: number,
): Promise<RouletteSession> {
	try {
		const response = await restClient.get<ApiResponse<RouletteSession>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}`,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to fetch roulette session");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function createRouletteSession(
	eventId: string,
	data: CreateRouletteSessionRequest & { logo?: File },
): Promise<RouletteSession> {
	try {
		const formData = new FormData();

		// Required: title
		formData.append("title", data.title);

		// Optional: draw_date
		if (data.draw_date) {
			formData.append("draw_date", data.draw_date);
		}

		// Optional: draw_styles (but validation runs if present)
		if (data.draw_styles) {
			formData.append("draw_styles[style]", data.draw_styles.style);
			formData.append("draw_styles[theme]", data.draw_styles.theme);
		}

		// Optional: wrapper_background
		if (data.wrapper_background) {
			formData.append(
				"wrapper_background[useImage]",
				String(data.wrapper_background.useImage),
			);
			if (data.wrapper_background.backgroundImgUrl) {
				formData.append(
					"wrapper_background[backgroundImgUrl]",
					data.wrapper_background.backgroundImgUrl,
				);
			}
			if (data.wrapper_background.backgroundColor) {
				formData.append(
					"wrapper_background[backgroundColor]",
					data.wrapper_background.backgroundColor,
				);
			}
		}

		// Required: is_multiple (used in validation)
		// When is_multiple is false, draw_counts must be exactly 1
		const isMultiple =
			data.is_multiple !== undefined ? data.is_multiple : false;
		formData.append("is_multiple", String(isMultiple));

		// Required: draw_counts (must be 1 if is_multiple is false, >= 1 if true)
		// Backend defaults to 1 if nil, but we should set it explicitly
		let drawCounts = data.draw_counts;
		if (drawCounts === undefined) {
			// If is_multiple is false, must be 1; if true, default to 1
			drawCounts = 1;
		} else if (!isMultiple && drawCounts !== 1) {
			// Validation: if is_multiple is false, draw_counts must be 1
			drawCounts = 1;
		}
		formData.append("draw_counts", String(drawCounts));

		// Optional: logo
		if (data.logo) {
			formData.append("logo", data.logo);
		}

		const response = await restClient.postFormData<
			ApiResponse<RouletteSession>
		>(`v1/events/${eventId}/roulette/sessions`, formData);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to create roulette session");
		}

		return response.data;
	} catch (error) {
		// Enhanced error logging
		console.error("Error creating roulette session:", error);
		if (error && typeof error === "object" && "response" in error) {
			const httpError = error as {
				response?: { status?: number; json?: () => Promise<unknown> };
			};
			console.error("HTTP Status:", httpError.response?.status);
			try {
				const errorBody = await httpError.response?.json?.();
				console.error("Error body:", errorBody);
			} catch {
				// Ignore JSON parse errors
			}
		}
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function updateRouletteSession(
	eventId: string,
	sessionId: number,
	data: UpdateRouletteSessionRequest & {
		logo?: File;
		remove_logo?: boolean;
	},
): Promise<RouletteSession> {
	try {
		const formData = new FormData();
		if (data.title) {
			formData.append("title", data.title);
		}
		if (data.draw_date) {
			formData.append("draw_date", data.draw_date);
		}
		if (data.draw_styles) {
			formData.append("draw_styles[style]", data.draw_styles.style);
			formData.append("draw_styles[theme]", data.draw_styles.theme);
		}
		if (data.wrapper_background) {
			formData.append(
				"wrapper_background[useImage]",
				String(data.wrapper_background.useImage),
			);
			if (data.wrapper_background.backgroundImgUrl) {
				formData.append(
					"wrapper_background[backgroundImgUrl]",
					data.wrapper_background.backgroundImgUrl,
				);
			}
			if (data.wrapper_background.backgroundColor) {
				formData.append(
					"wrapper_background[backgroundColor]",
					data.wrapper_background.backgroundColor,
				);
			}
		}
		if (data.is_multiple !== undefined) {
			formData.append("is_multiple", String(data.is_multiple));
		}
		if (data.draw_counts !== undefined) {
			formData.append("draw_counts", String(data.draw_counts));
		}
		if (data.logo) {
			formData.append("logo", data.logo);
		}
		if (data.remove_logo) {
			formData.append("remove_logo", "true");
		}

		const response = await restClient.patchFormData<
			ApiResponse<RouletteSession>
		>(`v1/events/${eventId}/roulette/sessions/${sessionId}`, formData);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to update roulette session");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function deleteRouletteSession(
	eventId: string,
	sessionId: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/roulette/sessions/${sessionId}`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getRoulettePrizes(
	eventId: string,
	sessionId: number,
): Promise<RoulettePrize[]> {
	try {
		const response = await restClient.get<ApiResponse<RoulettePrize[]>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/prizes`,
		);

		if (!response.success) {
			throw new Error(response.message || "Failed to fetch roulette prizes");
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function createRoulettePrize(
	eventId: string,
	sessionId: number,
	data: CreateRoulettePrizeRequest & { image?: File },
): Promise<RoulettePrize> {
	try {
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("quantity", String(data.quantity));
		if (data.image) {
			formData.append("image", data.image);
		}

		const response = await restClient.postFormData<ApiResponse<RoulettePrize>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/prizes`,
			formData,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to create roulette prize");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function updateRoulettePrize(
	eventId: string,
	sessionId: number,
	prizeId: number,
	data: UpdateRoulettePrizeRequest & { image?: File; remove_image?: boolean },
): Promise<RoulettePrize> {
	try {
		const formData = new FormData();
		if (data.name) {
			formData.append("name", data.name);
		}
		if (data.quantity !== undefined) {
			formData.append("quantity", String(data.quantity));
		}
		if (data.image) {
			formData.append("image", data.image);
		}
		if (data.remove_image) {
			formData.append("remove_image", "true");
		}

		const response = await restClient.patchFormData<ApiResponse<RoulettePrize>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/prizes/${prizeId}`,
			formData,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to update roulette prize");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function deleteRoulettePrize(
	eventId: string,
	sessionId: number,
	prizeId: number,
): Promise<void> {
	try {
		await restClient.delete(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/prizes/${prizeId}`,
		);
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getRouletteWinners(
	eventId: string,
	sessionId: number,
): Promise<RouletteWinner[]> {
	try {
		const response = await restClient.get<ApiResponse<RouletteWinner[]>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/winners`,
		);

		if (!response.success) {
			throw new Error(response.message || "Failed to fetch roulette winners");
		}

		return response.data || [];
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function createRouletteWinner(
	eventId: string,
	sessionId: number,
	data: CreateRouletteWinnerRequest,
): Promise<RouletteWinner> {
	try {
		const payload: Record<string, string | number> = {
			prize_id: data.prize_id,
		};
		if (data.ticket_public_id) {
			payload.ticket_public_id = data.ticket_public_id;
		}
		if (data.visitor_public_id) {
			payload.visitor_public_id = data.visitor_public_id;
		}

		const response = await restClient.post<ApiResponse<RouletteWinner>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/winners`,
			payload,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to create roulette winner");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Delete Roulette Winner
 * DELETE /v1/events/:event_id/roulette/sessions/:session_id/winners/:winner_id
 * Returns the updated prize with remaining quantity and winners list
 */
export async function deleteRouletteWinner(
	eventId: string,
	sessionId: number,
	winnerId: number,
): Promise<RoulettePrize> {
	try {
		const response = await restClient.delete<ApiResponse<RoulettePrize>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/winners/${winnerId}`,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to delete winner");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Notify Roulette Winner
 * POST /v1/events/:event_id/roulette/sessions/:session_id/winners/:winner_id/notify
 * Sends webhook notification for the winner
 */
export async function notifyRouletteWinner(
	eventId: string,
	sessionId: number,
	winnerId: number,
): Promise<RouletteWinner> {
	try {
		const response = await restClient.post<ApiResponse<RouletteWinner>>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/winners/${winnerId}/notify`,
		);

		if (!response.success || !response.data) {
			throw new Error(response.message || "Failed to send notification");
		}

		return response.data;
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

/**
 * Get Roulette Participant
 * GET /v1/events/:event_id/roulette/sessions/:session_id/participants/:id
 * Fetches a ticket or visitor by public_id or id for roulette feature
 */
export async function getRouletteParticipant(
	eventId: string,
	sessionId: number,
	participantId: string,
): Promise<RouletteParticipant> {
	try {
		const response = await restClient.get<
			ApiResponse<BackendRouletteParticipant>
		>(
			`v1/events/${eventId}/roulette/sessions/${sessionId}/participants/${participantId}`,
		);

		if (!response.success || !response.data) {
			throw new Error(
				response.message || "Failed to fetch roulette participant",
			);
		}

		const backendData = response.data;
		const isTicket = backendData.type === "ticket";

		// Normalize the response to frontend-friendly format
		return {
			type: backendData.type,
			id: backendData.id,
			publicId: backendData.public_id,
			role: backendData.role,
			checkedIn: backendData.checked_in,
			checkInAt: backendData.check_in_at,
			status: backendData.status,
			// Normalize name field (tickets use attendee_name, visitors use full_name)
			name: isTicket
				? backendData.attendee_name || "Unknown Attendee"
				: backendData.full_name || "Unknown Visitor",
			// Normalize email/phone (tickets use attendee_*, visitors use direct fields)
			email: isTicket ? backendData.attendee_email : backendData.email,
			phone: isTicket ? backendData.attendee_phone : backendData.phone,
			// Event info
			eventId: backendData.event.id,
			eventName: backendData.event.title,
			// Scanned by
			scannedBy: backendData.scanned_by
				? {
						id: backendData.scanned_by.id,
						fullName: backendData.scanned_by.full_name,
					}
				: undefined,
			// Ticket-specific
			ticketType: backendData.ticket_type
				? {
						id: backendData.ticket_type.id,
						name: backendData.ticket_type.name,
						price: backendData.ticket_type.price,
					}
				: undefined,
			// Visitor-specific
			gender: backendData.gender,
			age: backendData.age,
		};
	} catch (error) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
