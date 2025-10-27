import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";

// Response types matching backend API
export type GlobalAnalytics = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number; // in cents
};

export type WeeklyDataPoint = {
	date: string;
	count: number;
};

export type EventAnalytics = {
	totalTickets: number;
	totalScannedTickets: number;
	totalUnscannedTickets: number;
	totalAmountPrice: number; // in cents
};

export const restapiAnalyticRouter = router({
	// Global analytics endpoints
	getGlobalTotalTickets: protectedProcedure.query<number>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ totalTickets: number }>(
			"v1/analytics/total_tickets",
			ctx.token,
		);
		return response.totalTickets;
	}),

	getGlobalScannedTickets: protectedProcedure.query<number>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ totalScannedTickets: number }>(
			"v1/analytics/total_scanned_tickets",
			ctx.token,
		);
		return response.totalScannedTickets;
	}),

	getGlobalUnscannedTickets: protectedProcedure.query<number>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ totalUnscannedTickets: number }>(
			"v1/analytics/total_unscanned_tickets",
			ctx.token,
		);
		return response.totalUnscannedTickets;
	}),

	getGlobalTotalRevenue: protectedProcedure.query<number>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ totalAmountPrice: number }>(
			"v1/analytics/total_amount_price",
			ctx.token,
		);
		return response.totalAmountPrice; // in cents
	}),

	getWeeklyRegisteredTickets: protectedProcedure.query<WeeklyDataPoint[]>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ weeklyRegisteredTickets: WeeklyDataPoint[] }>(
			"v1/analytics/weekly_registered_tickets",
			ctx.token,
		);
		return response.weeklyRegisteredTickets;
	}),

	getWeeklyScannedTickets: protectedProcedure.query<WeeklyDataPoint[]>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ weeklyScannedTickets: WeeklyDataPoint[] }>(
			"v1/analytics/weekly_scanned_tickets",
			ctx.token,
		);
		return response.weeklyScannedTickets;
	}),

	getWeeklySalesAmount: protectedProcedure.query<WeeklyDataPoint[]>(async ({ ctx }) => {
		const response = await protectedHttpClient.get<{ weeklySalesAmount: WeeklyDataPoint[] }>(
			"v1/analytics/weekly_sales_amount",
			ctx.token,
		);
		return response.weeklySalesAmount;
	}),

	// Event-specific analytics endpoints
	getEventTotalTickets: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<number>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ totalTickets: number }>(
				`v1/events/${input.eventId}/analytics/total_tickets`,
				ctx.token,
			);
			return response.totalTickets;
		}),

	getEventScannedTickets: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<number>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ totalScannedTickets: number }>(
				`v1/events/${input.eventId}/analytics/total_scanned_tickets`,
				ctx.token,
			);
			return response.totalScannedTickets;
		}),

	getEventUnscannedTickets: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<number>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ totalUnscannedTickets: number }>(
				`v1/events/${input.eventId}/analytics/total_unscanned_tickets`,
				ctx.token,
			);
			return response.totalUnscannedTickets;
		}),

	getEventTotalRevenue: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<number>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ totalAmountPrice: number }>(
				`v1/events/${input.eventId}/analytics/total_amount_price`,
				ctx.token,
			);
			return response.totalAmountPrice; // in cents
		}),

	getEventWeeklyRegisteredTickets: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<WeeklyDataPoint[]>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ weeklyRegisteredTickets: WeeklyDataPoint[] }>(
				`v1/events/${input.eventId}/analytics/weekly_registered_tickets`,
				ctx.token,
			);
			return response.weeklyRegisteredTickets;
		}),

	getEventWeeklyScannedTickets: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<WeeklyDataPoint[]>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ weeklyScannedTickets: WeeklyDataPoint[] }>(
				`v1/events/${input.eventId}/analytics/weekly_scanned_tickets`,
				ctx.token,
			);
			return response.weeklyScannedTickets;
		}),

	getEventWeeklySalesAmount: protectedProcedure
		.input(z.object({ eventId: z.number() }))
		.query<WeeklyDataPoint[]>(async ({ input, ctx }) => {
			const response = await protectedHttpClient.get<{ weeklySalesAmount: WeeklyDataPoint[] }>(
				`v1/events/${input.eventId}/analytics/weekly_sales_amount`,
				ctx.token,
			);
			return response.weeklySalesAmount;
		}),
});
