export type Event = {
	id: string;
	title: string;
	status: "active" | "inactive";
	description?: string;
	createdAt: string;
};

type BaseUser = {
	id: string;
	name: string;
	email: string;
};

export type BaseLocation = {
	id: string;
	name: string;
	scanLimit: number;
	assignedMembers: BaseUser[];
};

type CustomLabel = {
	name: string;
	value: string;
};

type RestrictedLocation = {
	id: string;
	name: string;
};

type TicketUser = BaseUser & {
	phone: string;
};

export type BaseTicket = TicketUser & {
	value: number;
	status: "scanned" | "not_scanned";
	customLabels: Array<CustomLabel>;
	restrictedLocations?: Array<RestrictedLocation>;
	createdAt: string;
	ticketTypeId?: number;
	ticketTypeName?: string;
	checkedIn?: boolean;
	checkInAt?: string | null;
	eventName?: string;
	eventId?: number;
};

export type PendingTicket = BaseTicket & {
	paymentStatus: "pending" | "paid" | "failed" | "refunded_payment";
	paymentScreenshotUrl?: string;
	transactionId?: string;
	paymentMethod?: string;
};

export type ScannedLog = TicketUser & {
	locationName: string;
	scannedBy: string;
	status: "scanned" | "not_scanned";
	checkedInAt: string;
};

type ChartData = {
	date: string;
	count: number;
};

export type Analytics = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmount: number;
	weeklyRegisteredTickets: ChartData[];
	weeklyScannedTickets: ChartData[];
	weeklySalesAmount: ChartData[];
};

export type ExportLogs = {
	id: string;
	fileName: string;
	category: "scan_history" | "tickets";
	recordCount: number;
	fileUrl: string;
	createdAt: string;
};
