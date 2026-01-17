import type { Participant } from "@/stores/lucky-draw-store";

export enum DrawState {
	IDLE = "IDLE",
	SPINNING = "SPINNING",
	WON = "WON",
}

// Prize type for prize roulette
export type Prize = {
	id: number;
	name: string;
	quantity: number;
	remaining?: number;
	image_url?: string | null;
};

// This operation requires multiple file edits. I will perform them sequentially.
// First: Update type.ts

export interface DrawProps {
	participants?: Participant[];
	prizes?: Prize[];
	mode?: "participants" | "prizes";
	onDrawComplete: (winner: Participant | Prize) => void;
	isDrawing: boolean;
	isCelebrating?: boolean;
	onDraw?: () => void; // New optional prop for triggering draw from within component
	theme?: string; // Add theme prop to interface since it's used
	useGifts?: boolean; // Whether gift system is enabled
	hasAvailableGift?: boolean; // Whether there's a gift available to assign
}
