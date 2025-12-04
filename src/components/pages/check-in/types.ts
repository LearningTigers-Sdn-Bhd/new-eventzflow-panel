export type CheckInMethod = "email" | "phone" | "name" | "scan" | null;
export type CheckInStep = "input" | "select" | "confirm" | "missing_data" | "result" | "registration" | "scan";

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
		email?: string;
		phone?: string;
		ticketType?: string;
		eventName?: string;
	};
}
