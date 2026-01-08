import { restClient } from "@/utils/rest-api";
import {
	type GetPermissionContextRequest,
	getPermissionContextSchema,
} from "./request";
import type {
	BackendPermissionContextResponse,
	PermissionContext,
} from "./response";

/**
 * Get permission context for a user
 * GET /v1/resources/permission_context/:id
 */
export async function getPermissionContext(
	data: GetPermissionContextRequest,
): Promise<PermissionContext> {
	try {
		const validated = getPermissionContextSchema.parse(data);

		const response = await restClient.get<{
			success: boolean;
			data: BackendPermissionContextResponse;
		}>(`v1/resources/permission_context/${validated.userId}`);

		const { data: backendData } = response;

		return {
			userId: validated.userId.toString(),
			resources: {
				hasWriterPermission: backendData.has_writer_permission,
				isOfficial: backendData.is_official,
			},
			updatedAt: backendData.updated_at,
		};
	} catch (error: unknown) {
		console.error("Error fetching permission context:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch permission context",
		);
	}
}
