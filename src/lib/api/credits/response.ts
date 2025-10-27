// Pure TypeScript types for API responses

// Frontend types
export type TransactionLog = {
	id: string;
	date: string;
	description: string;
	type: "purchase" | "refund" | "bonus";
	amount: number;
	balance: number;
};

export type CreditDeduction = {
	id: string;
	event: string;
	recipient: string;
	channel: string;
	credits: number;
	status: "sent" | "failed" | "pending";
	date: string;
};

export type ConsumptionCharge = {
	id: string;
	country: string;
	countryCode: string;
	waMessageCredits: number;
};

export type CreditStats = {
	currentBalance: number;
};

// Backend response types (raw API responses)
export type BackendTransactionLog = {
	id: string;
	date: string;
	description: string;
	type: string;
	amount: number;
	balance: number;
};

export type BackendCreditDeduction = {
	id: string;
	event: string;
	recipient: string;
	channel: string;
	credits: number;
	status: string;
	date: string;
};

export type BackendConsumptionCharge = {
	id: string;
	country: string;
	country_code: string;
	wa_message_credits: number;
};

export type BackendCreditStats = {
	current_balance: number;
};
