import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { enhancedHttpClient } from "../../lib/http-client";

// Mock data for analytics
export type totalTicketsResponse = {
	totalTickets: number;
};

export type totalScannedTicketsResponse = {
	totalScannedTickets: number;
};

export type totalUnscannedTicketsResponse = {
	totalUnscannedTickets: number;
};

export type totalAmountPriceResponse = {
	totalAmountPrice: number;
};

type dateCountColumn = {
	date: string;
	count: number;
};

export type weeklyRegisteredTicketsResponse = {
	weeklyRegisteredTickets: dateCountColumn[];
};

export type weeklyScannedTicketsResponse = {
	weeklyScannedTickets: dateCountColumn[];
};

export type weeklySalesAmountResponse = {
	weeklySalesAmount: dateCountColumn[];
};

export const analyticRouter = router({
	// Aggregate all analytics in a single server-side call to reduce client requests
	getAllEventAnalytics: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ input, ctx }) => {
			const eventId = input.id;

			console.log(`🔄 Starting analytics fetch for event ${eventId}`);

			// Execute first endpoint separately
			console.log(`📊 Fetching first endpoint - total tickets...`);
			const totalTickets = await enhancedHttpClient.get<totalTicketsResponse>(
				`v1/events/${eventId}/analytics/total_tickets`,
				ctx.token,
			);
			console.log(`✅ Total tickets fetched: ${totalTickets.totalTickets}`);

			// Execute remaining 6 endpoints in parallel
			console.log(`📊 Fetching remaining 6 analytics endpoints in parallel...`);
			const [
				totalScannedTickets,
				totalUnscannedTickets,
				totalAmountPrice,
				weeklyRegisteredTickets,
				weeklyScannedTickets,
				weeklySalesAmount,
			] = await Promise.all([
				enhancedHttpClient.get<totalScannedTicketsResponse>(
					`v1/events/${eventId}/analytics/total_scanned_tickets`,
					ctx.token,
				),
				enhancedHttpClient.get<totalUnscannedTicketsResponse>(
					`v1/events/${eventId}/analytics/total_unscanned_tickets`,
					ctx.token,
				),
				enhancedHttpClient.get<totalAmountPriceResponse>(
					`v1/events/${eventId}/analytics/total_amount_price`,
					ctx.token,
				),
				enhancedHttpClient.get<weeklyRegisteredTicketsResponse>(
					`v1/events/${eventId}/analytics/weekly_registered_tickets`,
					ctx.token,
				),
				enhancedHttpClient.get<weeklyScannedTicketsResponse>(
					`v1/events/${eventId}/analytics/weekly_scanned_tickets`,
					ctx.token,
				),
				enhancedHttpClient.get<weeklySalesAmountResponse>(
					`v1/events/${eventId}/analytics/weekly_sales_amount`,
					ctx.token,
				),
			]);

			console.log(`✅ Remaining 6 endpoints completed successfully`);
			console.log(`🎉 All analytics fetched successfully for event ${eventId}`);

			return {
				totalTickets: totalTickets.totalTickets,
				totalScannedTickets: totalScannedTickets.totalScannedTickets,
				totalUnscannedTickets: totalUnscannedTickets.totalUnscannedTickets,
				totalAmountPrice: totalAmountPrice.totalAmountPrice,
				weeklyRegisteredTickets:
					weeklyRegisteredTickets.weeklyRegisteredTickets,
				weeklyScannedTickets: weeklyScannedTickets.weeklyScannedTickets,
				weeklySalesAmount: weeklySalesAmount.weeklySalesAmount,
			} as const;
		}),
	getTotalTickets: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<totalTicketsResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<totalTicketsResponse>(
					`v1/events/${input.id}/analytics/total_tickets`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get total tickets for event ${input.id}:`,
					error,
				);
				// Fallback: Provide meaningful error message
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Total tickets not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getTotalScannedTickets: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<totalScannedTicketsResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<totalScannedTicketsResponse>(
					`v1/events/${input.id}/analytics/total_scanned_tickets`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get total scanned tickets for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Total scanned tickets not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getTotalUnscannedTickets: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<totalUnscannedTicketsResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<totalUnscannedTicketsResponse>(
					`v1/events/${input.id}/analytics/total_unscanned_tickets`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get total unscanned tickets for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Total unscanned tickets not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getTotalAmountPrice: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<totalAmountPriceResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<totalAmountPriceResponse>(
					`v1/events/${input.id}/analytics/total_amount_price`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get total amount price for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Total amount price not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getWeeklyRegisteredTickets: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<weeklyRegisteredTicketsResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<weeklyRegisteredTicketsResponse>(
					`v1/events/${input.id}/analytics/weekly_registered_tickets`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get weekly registered tickets for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Weekly registered tickets not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getWeeklyScannedTickets: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<weeklyScannedTicketsResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<weeklyScannedTicketsResponse>(
					`v1/events/${input.id}/analytics/weekly_scanned_tickets`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get weekly scanned tickets for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Weekly scanned tickets not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),

	getWeeklySalesAmount: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<weeklySalesAmountResponse>(async ({ input, ctx }) => {
			try {
				return await enhancedHttpClient.get<weeklySalesAmountResponse>(
					`v1/events/${input.id}/analytics/weekly_sales_amount`,
					ctx.token,
				);
			} catch (error) {
				console.error(
					`❌ Failed to get weekly sales amount for event ${input.id}:`,
					error,
				);
				if (error instanceof TRPCError && error.code === "NOT_FOUND") {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: `Weekly sales amount not found for event ID: ${input.id}`,
					});
				}
				throw error;
			}
		}),
});
