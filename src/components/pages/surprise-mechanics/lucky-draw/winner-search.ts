import type { InvalidParticipant } from "@/lib/api/lucky-draw/response";

const normalize = (value: string) =>
	value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function filterWinners(winners: InvalidParticipant[], query: string) {
	const terms = query.split(/\s+/).map(normalize).filter(Boolean);
	if (!terms.length) return winners;
	return winners.filter((winner) => {
		const fields = [
			winner.participant.name,
			winner.participant.contact,
			winner.participant.ic_passport_no,
			winner.participant.ticket_public_id,
			winner.gift_taken,
		].map((value) => normalize(value ?? ""));
		return terms.every((term) => fields.some((field) => field.includes(term)));
	});
}
