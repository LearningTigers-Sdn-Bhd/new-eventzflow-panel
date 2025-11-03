export type CheckInMethod = "email" | "phone" | "name" | null;
export type CheckInStep = "input" | "select" | "confirm" | "result";

export interface TicketData {
	publicId: string;
	name: string;
	email: string;
	phone?: string;
	ticketType: string;
	eventName: string;
	checkedIn: boolean;
}

export interface ResultData {
	success: boolean;
	message: string;
	details?: {
		name?: string;
		ticketType?: string;
		eventName?: string;
	};
}
