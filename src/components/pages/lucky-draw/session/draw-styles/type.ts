import type { Participant } from "@/stores/lucky-draw-store";

export enum DrawState {
	IDLE = "IDLE",
	SPINNING = "SPINNING",
	WON = "WON",
}

export interface DrawProps {
	participants: Participant[];
	onDrawComplete: (winner: Participant) => void;
	isDrawing: boolean;
	isCelebrating?: boolean;
}
