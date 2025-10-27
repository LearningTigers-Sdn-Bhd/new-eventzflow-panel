// TODO: Uncomment when backend is ready
// import { restClient } from "@/utils/rest-api";
import type {
	// TODO: Uncomment when backend is ready
	// BackendConsumptionCharge,
	// BackendCreditDeduction,
	// BackendCreditStats,
	// BackendTransactionLog,
	ConsumptionCharge,
	CreditDeduction,
	CreditStats,
	TransactionLog,
} from "./response";

/**
 * Get transaction logs
 * TODO: Replace with actual API call when backend is ready
 */
export async function getTransactionLogs(): Promise<TransactionLog[]> {
	// Mock data for development
	return [
		{
			id: "1",
			date: new Date().toISOString(),
			description: "Initial credit purchase",
			type: "purchase" as const,
			amount: 1000,
			balance: 1000,
		},
		{
			id: "2",
			date: new Date(Date.now() - 86400000).toISOString(),
			description: "WhatsApp message credits",
			type: "purchase" as const,
			amount: 500,
			balance: 1500,
		},
		{
			id: "3",
			date: new Date(Date.now() - 172800000).toISOString(),
			description: "Welcome bonus",
			type: "bonus" as const,
			amount: 200,
			balance: 1700,
		},
	];

	// Uncomment when backend is ready:
	// const response = await restClient.get<BackendTransactionLog[]>(
	// 	"v1/credits/transaction-logs",
	// );
	// return response.map((log) => ({
	// 	id: log.id,
	// 	date: log.date,
	// 	description: log.description,
	// 	type: log.type as "purchase" | "refund" | "bonus",
	// 	amount: log.amount,
	// 	balance: log.balance,
	// }));
}

/**
 * Get credit deductions
 * TODO: Replace with actual API call when backend is ready
 */
export async function getCreditDeductions(): Promise<CreditDeduction[]> {
	// Mock data for development
	return [
		{
			id: "1",
			event: "Music Festival 2024",
			recipient: "+1234567890",
			channel: "WhatsApp",
			credits: 1,
			status: "sent" as const,
			date: new Date().toISOString(),
		},
		{
			id: "2",
			event: "Tech Conference",
			recipient: "+9876543210",
			channel: "WhatsApp",
			credits: 2,
			status: "sent" as const,
			date: new Date(Date.now() - 3600000).toISOString(),
		},
		{
			id: "3",
			event: "Summer Workshop",
			recipient: "+5555555555",
			channel: "WhatsApp",
			credits: 1,
			status: "failed" as const,
			date: new Date(Date.now() - 7200000).toISOString(),
		},
	];

	// Uncomment when backend is ready:
	// const response = await restClient.get<BackendCreditDeduction[]>(
	// 	"v1/credits/deductions",
	// );
	// return response.map((deduction) => ({
	// 	id: deduction.id,
	// 	event: deduction.event,
	// 	recipient: deduction.recipient,
	// 	channel: deduction.channel,
	// 	credits: deduction.credits,
	// 	status: deduction.status as "sent" | "failed" | "pending",
	// 	date: deduction.date,
	// }));
}

/**
 * Get consumption charges
 * TODO: Replace with actual API call when backend is ready
 */
export async function getConsumptionCharges(): Promise<ConsumptionCharge[]> {
	// Mock data for development
	return [
		{
			id: "1",
			country: "United States",
			countryCode: "1",
			waMessageCredits: 1,
		},
		{
			id: "2",
			country: "United Kingdom",
			countryCode: "44",
			waMessageCredits: 1,
		},
		{
			id: "3",
			country: "India",
			countryCode: "91",
			waMessageCredits: 2,
		},
		{
			id: "4",
			country: "Brazil",
			countryCode: "55",
			waMessageCredits: 3,
		},
		{
			id: "5",
			country: "Nigeria",
			countryCode: "234",
			waMessageCredits: 4,
		},
	];

	// Uncomment when backend is ready:
	// const response = await restClient.get<BackendConsumptionCharge[]>(
	// 	"v1/credits/consumption-charges",
	// );
	// return response.map((charge) => ({
	// 	id: charge.id,
	// 	country: charge.country,
	// 	countryCode: charge.country_code,
	// 	waMessageCredits: charge.wa_message_credits,
	// }));
}

/**
 * Get credit stats
 * TODO: Replace with actual API call when backend is ready
 */
export async function getCreditStats(): Promise<CreditStats> {
	// Mock data for development
	return {
		currentBalance: 1250,
	};

	// Uncomment when backend is ready:
	// const response = await restClient.get<BackendCreditStats>("v1/credits/stats");
	// return {
	// 	currentBalance: response.current_balance,
	// };
}
