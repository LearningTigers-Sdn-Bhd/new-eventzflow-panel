import type { Gift, Participant } from "@/stores/lucky-draw-store";
import type { AssignWinnerRequest } from "./request";
import type {
	Gift as BackendGift,
	Participant as BackendParticipant,
	InvalidParticipant,
} from "./response";

/**
 * Transform backend Gift to frontend Gift format
 * Note: GiftWinner doesn't include participant name - we'll need to handle this
 * The winner name should ideally come from the participants list or be included in the GiftWinner response
 */
export function transformGift(
	backendGift: BackendGift,
	useTicket: boolean,
	participantsMap?: Map<number, BackendParticipant>,
): Gift {
	// Take first winner if exists, otherwise null (for UI display)
	const firstWinner = backendGift.winners[0] || null;
	let winner: Participant | null = null;

	if (firstWinner) {
		// Determine participant ID from ticket_id or visitor_id
		const participantId =
			firstWinner.ticket_id ?? firstWinner.visitor_id ?? null;

		if (participantId !== null) {
			// Use participant_name from backend response, fallback to map or placeholder
			const participantName =
				firstWinner.participant_name ??
				participantsMap?.get(participantId)?.name ??
				`Participant ${participantId}`;

			winner = {
				name: participantName,
				type: useTicket ? "ticket" : "visitor",
				publicId: String(participantId),
			};
		}
	}

	return {
		id: String(backendGift.id),
		name: backendGift.name,
		order: backendGift.order,
		winner_counts: backendGift.winner_counts,
		winner,
		// Store actual winner count for logic
		actual_winner_count: backendGift.winners.length,
		// Store all winners for collapsible display
		allWinners: backendGift.winners
			.map((w) => {
				const participantId = w.ticket_id ?? w.visitor_id ?? null;
				if (participantId !== null) {
					// Use participant_name from backend response, fallback to map or placeholder
					const participantName =
						w.participant_name ??
						participantsMap?.get(participantId)?.name ??
						`Participant ${participantId}`;
					return {
						id: w.id,
						name: participantName,
						type: useTicket ? "ticket" : "visitor",
						publicId: String(participantId),
					};
				}
				return null;
			})
			.filter((w): w is Participant & { id: number } => w !== null),
	};
}

/**
 * Transform backend Participant to frontend Participant format
 * Note: Backend only returns {id, name}, so type must be inferred from event's use_ticket flag
 */
export function transformParticipant(
	backendParticipant: BackendParticipant,
	useTicket: boolean,
): Participant {
	return {
		name: backendParticipant.name,
		type: useTicket ? "ticket" : "visitor",
		publicId: String(backendParticipant.id),
	};
}

/**
 * Transform backend InvalidParticipant to frontend Participant format
 */
export function transformInvalidParticipant(
	backendInvalid: InvalidParticipant,
	useTicket: boolean,
): Participant {
	return {
		name: backendInvalid.participant.name,
		type: useTicket ? "ticket" : "visitor",
		publicId: String(backendInvalid.participant.id),
	};
}

/**
 * Transform frontend Participant to API request format for winner assignment
 */
export function transformParticipantToAPI(
	participant: Participant,
	useTicket: boolean,
): AssignWinnerRequest {
	// Parse publicId to get the participant ID
	const participantId = Number.parseInt(participant.publicId, 10);

	if (useTicket && participant.type === "ticket") {
		return {
			ticket_id: participantId,
		};
	}
	return {
		visitor_id: participantId,
	};
}

/**
 * Transform frontend Gift array to API update requests for reordering
 */
export function transformGiftOrderToAPI(
	gifts: Gift[],
): Array<{ giftId: number; order: number }> {
	return gifts.map((gift, index) => ({
		giftId: Number.parseInt(gift.id, 10),
		order: index + 1,
	}));
}
