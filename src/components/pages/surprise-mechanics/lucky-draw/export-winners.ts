import { neutralizeFormula } from "@/components/pages/feedback-form/responses/export/csv";
import type { InvalidParticipant } from "@/lib/api/lucky-draw/response";
import type { Gift } from "@/stores/lucky-draw-store";

/** One list of winners: a gift or a draw round. */
export interface WinnerGroup {
	title: string;
	names: string[];
	/** Phone, else email of each winner, same order as `names`. Tells same-name winners apart */
	contacts?: (string | null | undefined)[];
	/** Gift each winner got, same order as `names` (round sweep lists only) */
	gifts?: string[];
}

/** Gifts off: one group per draw round; winners saved before rounds existed come first. */
function groupByRound(winners: InvalidParticipant[]): WinnerGroup[] {
	const byRound = new Map<number | null, InvalidParticipant["participant"][]>();
	for (const { round, participant } of winners) {
		byRound.set(round, [...(byRound.get(round) ?? []), participant]);
	}
	return [...byRound]
		.sort(([a], [b]) => (a ?? 0) - (b ?? 0))
		.map(([round, people]) => ({
			title: round === null ? "Winners" : `Round ${round}`,
			names: people.map((p) => p.name),
			contacts: people.map((p) => p.contact),
		}));
}

export function buildWinnerGroups(
	useGifts: boolean,
	gifts: Gift[],
	invalidParticipants: InvalidParticipant[],
): WinnerGroup[] {
	if (!useGifts) {
		return groupByRound(invalidParticipants);
	}
	const sorted = [...gifts].sort((a, b) => a.order - b.order);
	const swept = sorted.flatMap((gift) =>
		(gift.allWinners ?? []).flatMap((w) =>
			typeof w.round === "number"
				? [
						{
							round: w.round,
							gift: gift.name,
							name: w.name,
							contact: w.contact,
						},
					]
				: [],
		),
	);
	if (swept.length === 0) {
		return sorted.map((gift) => ({
			title: gift.name,
			names: (gift.allWinners ?? []).map((w) => w.name),
			contacts: (gift.allWinners ?? []).map((w) => w.contact),
		}));
	}

	// Round sweep: one list per round, each winner next to the gift they got.
	// Winners drawn gift by gift (no round) keep their own gift list.
	const perGift = sorted
		.map((gift) => {
			const winners = (gift.allWinners ?? []).filter(
				(w) => typeof w.round !== "number",
			);
			return {
				title: gift.name,
				names: winners.map((w) => w.name),
				contacts: winners.map((w) => w.contact),
			};
		})
		.filter((group) => group.names.length > 0);
	const rounds = [...new Set(swept.map((row) => row.round))].sort(
		(a, b) => a - b,
	);
	const perRound = rounds.map((round) => {
		const rows = swept.filter((row) => row.round === round);
		return {
			title: `Round ${round}`,
			names: rows.map((row) => row.name),
			contacts: rows.map((row) => row.contact),
			gifts: rows.map((row) => row.gift),
		};
	});
	return [...perGift, ...perRound];
}

/** One name per line, ready to paste into slides. A contact follows its name when known. */
export function namesToText(
	names: string[],
	contacts?: WinnerGroup["contacts"],
): string {
	return names
		.map((name, i) => (contacts?.[i] ? `${name} - ${contacts[i]}` : name))
		.join("\n");
}

const hasContacts = (group: WinnerGroup) => !!group.contacts?.some(Boolean);

function escapeCsv(value: string | number) {
	const text = String(neutralizeFormula(value));
	return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Excel needs the BOM to read UTF-8 names correctly.
const BOM = "﻿";

export function buildWinnersCsv(groups: WinnerGroup[]): string {
	const withGift = groups.some((group) => group.gifts);
	const withContact = groups.some(hasContacts);
	const rows: (string | number)[][] = [
		[
			"Round",
			"No.",
			"Name",
			...(withContact ? ["Phone / Email"] : []),
			...(withGift ? ["Gift"] : []),
		],
	];
	for (const group of groups) {
		group.names.forEach((name, i) => {
			const row: (string | number)[] = [group.title, i + 1, name];
			if (withContact) row.push(group.contacts?.[i] ?? "");
			if (withGift) row.push(group.gifts?.[i] ?? "");
			rows.push(row);
		});
	}
	return BOM + rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

/** Excel sheet names: max 31 chars, none of : \ / ? * [ ], unique. */
export function sheetNames(titles: string[]): string[] {
	const used = new Set<string>();
	return titles.map((title) => {
		const base =
			title
				.replace(/[:\\/?*[\]]/g, " ")
				.trim()
				.slice(0, 31) || "Sheet";
		let name = base;
		for (let n = 2; used.has(name.toLowerCase()); n++) {
			const suffix = ` (${n})`;
			name = base.slice(0, 31 - suffix.length) + suffix;
		}
		used.add(name.toLowerCase());
		return name;
	});
}

/** One sheet per round so each list can be copied straight into its slide. */
export async function buildWinnersXlsx(
	groups: WinnerGroup[],
): Promise<Uint8Array> {
	const XLSX = await import("xlsx-js-style");
	const wb = XLSX.utils.book_new();
	const names = sheetNames(groups.map((g) => g.title));

	groups.forEach((group, i) => {
		const { gifts, contacts } = group;
		const withContact = hasContacts(group);
		const rows = group.names.map((name, n) => [
			n + 1,
			neutralizeFormula(name),
			...(withContact ? [neutralizeFormula(contacts?.[n] ?? "")] : []),
			...(gifts ? [neutralizeFormula(gifts[n] ?? "")] : []),
		]);
		const sheet = XLSX.utils.aoa_to_sheet([
			[
				"No.",
				"Name",
				...(withContact ? ["Phone / Email"] : []),
				...(gifts ? ["Gift"] : []),
			],
			...rows,
		]);
		sheet["!cols"] = [
			{ wch: 6 },
			{ wch: 40 },
			...(withContact ? [{ wch: 30 }] : []),
			...(gifts ? [{ wch: 30 }] : []),
		];
		XLSX.utils.book_append_sheet(wb, sheet, names[i]);
	});

	return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}
