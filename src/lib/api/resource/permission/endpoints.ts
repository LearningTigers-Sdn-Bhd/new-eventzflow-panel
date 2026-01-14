import { restClient } from "@/utils/rest-api";
import {
	type CreateResourcePermissionRequest,
	createResourcePermissionSchema,
	type UpdateResourcePermissionRequest,
	updateResourcePermissionSchema,
} from "./request";
import type {
	BackendResourcePermission,
	ResourcePermission,
} from "./response";

function transformResourcePermission(
	backend: BackendResourcePermission,
): ResourcePermission {
	return {
		id: backend.id.toString(),
		user: {
			id: backend.user?.id?.toString() || backend.user_id.toString(),
			fullName: backend.user?.full_name || "",
			email: backend.user?.email || "",
			phone: backend.user?.phone,
		},
		status: backend.status,
		isOfficial: backend.is_official,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

// Error handler
function handleApiError(error: unknown, context: string): never {
	console.error(`Error in ${context}:`, error);
	const message =
		(error as { message?: string })?.message || `Failed to ${context}`;
	throw new Error(message);
}

export async function getResourcePermissions(options?: {
	page?: number;
	perPage?: number;
}): Promise<{ data: ResourcePermission[]; pagination?: any }> {
	try {
		const params = new URLSearchParams();
		if (options?.page) params.append("page", options.page.toString());
		if (options?.perPage) params.append("per_page", options.perPage.toString());

		const queryString = params.toString();
		const url = queryString
			? `v1/resources/permissions?${queryString}`
			: "v1/resources/permissions";

		const response = await restClient.get<{
			success: boolean;
			data?: BackendResourcePermission[];
			pagination?: any;
		}>(url);
		return {
			data: (response.data || []).map(transformResourcePermission),
			pagination: response.pagination,
		};
	} catch (error: unknown) {
		handleApiError(error, "fetch resource permissions");
	}
}

export async function getResourcePermission(
	id: string,
): Promise<ResourcePermission> {
	try {
		const response = await restClient.get<{
			success: boolean;
			data: BackendResourcePermission;
		}>(`v1/resources/permissions/${id}`);
		return transformResourcePermission(response.data);
	} catch (error: unknown) {
		handleApiError(error, "fetch resource permission");
	}
}

export async function createResourcePermission(
	data: CreateResourcePermissionRequest,
): Promise<ResourcePermission> {
	try {
		const validated = createResourcePermissionSchema.parse(data);
		const response = await restClient.post<{
			success: boolean;
			data: BackendResourcePermission;
		}>("v1/resources/permissions", { permission: validated });
		return transformResourcePermission(response.data);
	} catch (error: unknown) {
		handleApiError(error, "create resource permission");
	}
}

export async function updateResourcePermission(
	data: UpdateResourcePermissionRequest,
): Promise<ResourcePermission> {
	try {
		const validated = updateResourcePermissionSchema.parse(data);
		const response = await restClient.put<{
			success: boolean;
			data: BackendResourcePermission;
		}>(`v1/resources/permissions/${validated.id}`, {
			permission: { status: validated.status },
		});
		return transformResourcePermission(response.data);
	} catch (error: unknown) {
		handleApiError(error, "update resource permission");
	}
}

export async function deleteResourcePermission(id: string): Promise<void> {
	try {
		await restClient.delete(`v1/resources/permissions/${id}`);
	} catch (error: unknown) {
		handleApiError(error, "delete resource permission");
	}
}

export async function grantResourcePermission(data: {
	userIds: string[];
	status: "base" | "partnership";
	isOfficial: boolean;
}): Promise<ResourcePermission[]> {
	try {
		const responses = await Promise.all(
			data.userIds.map((userId) =>
				restClient
					.post<{
						success: boolean;
						data: BackendResourcePermission;
					}>("v1/resources/permissions", {
						permission: {
							user_id: userId,
							status: data.status,
							is_official: data.isOfficial,
						},
					})
					.then((res) => res.data),
			),
		);
		return responses.map(transformResourcePermission);
	} catch (error: unknown) {
		handleApiError(error, "grant resource permissions");
	}
}

export async function updateResourcePermissionFull(data: {
	id: string;
	status: "base" | "partnership";
	isOfficial: boolean;
}): Promise<ResourcePermission> {
	try {
		const response = await restClient.put<{
			success: boolean;
			data: BackendResourcePermission;
		}>(`v1/resources/permissions/${data.id}`, {
			permission: {
				status: data.status,
				is_official: data.isOfficial,
			},
		});
		return transformResourcePermission(response.data);
	} catch (error: unknown) {
		handleApiError(error, "update resource permission details");
	}
}
