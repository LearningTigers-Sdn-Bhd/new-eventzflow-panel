// Shared helpers for pick-only (no typing) time-block selectors used by
// both the per-event session defaults and per-session availability editor —
// keeps the "start/end time selects can't overlap existing blocks" behavior
// consistent everywhere blocks are added.

export interface TimeBlock {
	start_time: string;
	end_time: string;
}

// 30-minute increments, "00:00" .. "23:30".
export function generateTimeOptions(): string[] {
	const options: string[] = [];
	for (let m = 0; m < 24 * 60; m += 30) {
		const h = Math.floor(m / 60)
			.toString()
			.padStart(2, "0");
		const min = (m % 60).toString().padStart(2, "0");
		options.push(`${h}:${min}`);
	}
	return options;
}

export const TIME_OPTIONS = generateTimeOptions();

export function isWithinBlock(time: string, block: TimeBlock): boolean {
	return time >= block.start_time && time < block.end_time;
}

// Start times can't fall inside an already-booked block.
export function validStartTimes(blocks: TimeBlock[]): string[] {
	return TIME_OPTIONS.filter((t) => !blocks.some((b) => isWithinBlock(t, b)));
}

// End times must be after the chosen start, and can't run into the next block.
export function validEndTimes(blocks: TimeBlock[], start: string): string[] {
	const nextBoundary =
		blocks
			.map((b) => b.start_time)
			.filter((s) => s > start)
			.sort()[0] ?? "24:00";
	return TIME_OPTIONS.filter((t) => t > start && t <= nextBoundary);
}
