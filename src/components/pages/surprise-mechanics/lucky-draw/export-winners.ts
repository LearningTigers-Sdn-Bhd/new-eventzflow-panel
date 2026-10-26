import { neutralizeFormula } from "@/components/pages/feedback-form/responses/export/csv";
import type { InvalidParticipant } from "@/lib/api/lucky-draw/response";
import type { Gift } from "@/stores/lucky-draw-store";

/** One list of winners: a gift or a draw round. */
export interface WinnerGroup {
	title: string;
	names: string[];
	/** Gift each winner got, same order as `names` (round sweep lists only) */
	gifts?: string[];
}

/** Gifts off: one group per draw round; winners saved before rounds existed come first. */
function groupByRound(winners: InvalidParticipant[]): WinnerGroup[] {
	const byRound = new Map<number | null, string[]>();
	for (const { round, participant } of winners) {
		byRound.set(round, [...(byRound.get(round) ?? []), participant.name]);
	}
	return [...byRound]
		.sort(([a], [b]) => (a ?? 0) - (b ?? 0))
		.map(([round, names]) => ({
			title: round === null ? "Winners" : `Round ${round}`,
			names,
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
				? [{ round: w.round, gift: gift.name, name: w.name }]
				: [],
		),
	);
	if (swept.length === 0) {
		return sorted.map((gift) => ({
			title: gift.name,
			names: (gift.allWinners ?? []).map((w) => w.name),
		}));
	}

	// Round sweep: one list per round, each winner next to the gift they got.
	// Winners drawn gift by gift (no round) keep their own gift list.
	const perGift = sorted
		.map((gift) => ({
			title: gift.name,
			names: (gift.allWinners ?? [])
				.filter((w) => typeof w.round !== "number")
				.map((w) => w.name),
		}))
		.filter((group) => group.names.length > 0);
	const rounds = [...new Set(swept.map((row) => row.round))].sort(
		(a, b) => a - b,
	);
	const perRound = rounds.map((round) => {
		const rows = swept.filter((row) => row.round === round);
		return {
			title: `Round ${round}`,
			names: rows.map((row) => row.name),
			gifts: rows.map((row) => row.gift),
		};
	});
	return [...perGift, ...perRound];
}

/** One name per line, ready to paste into slides. */
export function namesToText(names: string[]): string {
	return names.join("\n");
}

function escapeCsv(value: string | number) {
	const text = String(neutralizeFormula(value));
	return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Excel needs the BOM to read UTF-8 names correctly.
const BOM = "﻿";

export function buildWinnersCsv(groups: WinnerGroup[]): string {
	const withGift = groups.some((group) => group.gifts);
	const rows: (string | number)[][] = [
		withGift ? ["Round", "No.", "Name", "Gift"] : ["Round", "No.", "Name"],
	];
	for (const group of groups) {
		group.names.forEach((name, i) => {
			const row: (string | number)[] = [group.title, i + 1, name];
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
		const { gifts } = group;
		const rows = group.names.map((name, n) => [
			n + 1,
			neutralizeFormula(name),
			...(gifts ? [neutralizeFormula(gifts[n] ?? "")] : []),
		]);
		const sheet = XLSX.utils.aoa_to_sheet([
			gifts ? ["No.", "Name", "Gift"] : ["No.", "Name"],
			...rows,
		]);
		sheet["!cols"] = [{ wch: 6 }, { wch: 40 }, ...(gifts ? [{ wch: 30 }] : [])];
		XLSX.utils.book_append_sheet(wb, sheet, names[i]);
	});

	return XLSX.write(wb, { type: "array", bookType: "xlsx" });
}
