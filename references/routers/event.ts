import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";

// Input schemas
const createEventSchema = z.object({
	title: z.string().min(3, "Event name must be at least 3 characters"),
	description: z.string().optional(),
	status: z.enum(["draft", "published", "cancelled"]).optional().default("draft"),
	visibility: z.boolean().optional().default(true),
	start_date: z.string(), // ISO date string
	end_date: z.string(), // ISO date string
	multiple_scans: z.boolean().optional().default(false),
	webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
	event_admin_id: z.number().optional(), // User ID to assign as event admin
});

const updateEventSchema = z.object({
	title: z.string().min(3).optional(),
	description: z.string().optional(),
	status: z.enum(["draft", "published", "cancelled"]).optional(),
	visibility: z.boolean().optional(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	multiple_scans: z.boolean().optional(),
	webhook_url: z.string().url().optional().or(z.literal("")),
	labels_data: z.record(z.string(), z.any()).optional(),
});

// Event type matching backend structure
export type Event = {
	id: number;
	title: string;
	description: string | null;
	status: "draft" | "published" | "cancelled";
	visibility: boolean;
	multiple_scans: boolean;
	start_date: string;
	end_date: string;
	webhook_url: string | null;
	labels_data: Record<string, any>;
	payment_status: "unpaid" | "paid" | "waived";
	price: string;
	published: boolean;
	created_at: string;
	updated_at: string;
};

// User type for event admin selection
export type MemberUser = {
	id: number;
	full_name: string;
	email: string;
	role: "member";
};

export const restapiEventRouter = router({
	getEvents: protectedProcedure.query<Event[]>(async ({ ctx }) => {
		return await protectedHttpClient.get<Event[]>("v1/events", ctx.token);
	}),

	// Get all users with member role for event admin assignment
	getMemberUsers: protectedProcedure.query<MemberUser[]>(async ({ ctx }) => {
		const users = await protectedHttpClient.get<Array<{
			id: number;
			full_name: string;
			email: string;
			role: "org_owner" | "manager" | "member";
		}>>("v1/team_members", ctx.token);
		// Filter only members
		return users.filter(user => user.role === "member") as MemberUser[];
	}),

	getEvent: protectedProcedure
		.input(z.object({ id: z.number() }))
		.query<Event>(async ({ input, ctx }) => {
			return await protectedHttpClient.get<Event>(
				`v1/events/${input.id}`,
				ctx.token,
			);
		}),

	createEvent: protectedProcedure
		.input(createEventSchema)
		.mutation(async ({ input, ctx }) => {
			return await protectedHttpClient.post<Event>(
				"v1/events",
				{ event: input },
				ctx.token,
			);
		}),

	updateEvent: protectedProcedure
		.input(z.object({ id: z.number(), data: updateEventSchema }))
		.mutation(async ({ input, ctx }) => {
			return await protectedHttpClient.put<Event>(
				`v1/events/${input.id}`,
				{ event: input.data },
				ctx.token,
			);
		}),

	deleteEvent: protectedProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ input, ctx }) => {
			return await protectedHttpClient.delete<void>(
				`v1/events/${input.id}`,
				ctx.token,
			);
		}),
});
