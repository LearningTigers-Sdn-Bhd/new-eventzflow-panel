import { z } from "zod";
import { protectedProcedure, router } from "../../index";
import { protectedHttpClient } from "../../lib/http-client";
import type { BaseLocation } from "./type";

// Backend response type
type BackendLocation = {
	id: number;
	name: string;
	scan_limit: number;
	event_id: number;
	members: Array<{
		id: number;
		full_name: string;
		email: string;
	}>;
	created_at: string;
	updated_at: string;
};

// Transform backend response to frontend format
function transformLocation(backendLocation: BackendLocation): BaseLocation {
	return {
		id: backendLocation.id.toString(),
		name: backendLocation.name,
		scanLimit: backendLocation.scan_limit,
		assignedMembers: backendLocation.members.map((member) => ({
			id: member.id.toString(),
			name: member.full_name,
			email: member.email,
		})),
	};
}

export const locationRouter = router({
	// GET /v1/events/:event_id/event_locations
	getLocations: protectedProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ input, ctx }) => {
			const locations = await protectedHttpClient.get<BackendLocation[]>(
				`v1/events/${input.eventId}/event_locations`,
				ctx.token,
			);
			return locations.map(transformLocation);
		}),

	// GET /v1/events/:event_id/event_locations/:id
	getLocationById: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				locationId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const location = await protectedHttpClient.get<BackendLocation>(
				`v1/events/${input.eventId}/event_locations/${input.locationId}`,
				ctx.token,
			);
			return transformLocation(location);
		}),

	// POST /v1/events/:event_id/event_locations
	createLocation: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				name: z.string().min(1, "Name is required"),
				scanLimit: z.number().min(0, "Scan limit must be at least 0"),
				memberIds: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const location = await protectedHttpClient.post<BackendLocation>(
				`v1/events/${input.eventId}/event_locations`,
				{
					event_location: {
						name: input.name,
						scan_limit: input.scanLimit,
						member_ids: input.memberIds || [],
					},
				},
				ctx.token,
			);
			return transformLocation(location);
		}),

	// PUT /v1/events/:event_id/event_locations/:id
	updateLocation: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				locationId: z.string(),
				name: z.string().min(1, "Name is required"),
				scanLimit: z.number().min(0, "Scan limit must be at least 0"),
				memberIds: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const location = await protectedHttpClient.put<BackendLocation>(
				`v1/events/${input.eventId}/event_locations/${input.locationId}`,
				{
					event_location: {
						name: input.name,
						scan_limit: input.scanLimit,
						member_ids: input.memberIds || [],
					},
				},
				ctx.token,
			);
			return transformLocation(location);
		}),

	// DELETE /v1/events/:event_id/event_locations/:id
	deleteLocation: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				locationId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await protectedHttpClient.delete(
				`v1/events/${input.eventId}/event_locations/${input.locationId}`,
				ctx.token,
			);
			return { success: true };
		}),
});
