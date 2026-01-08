import { restClient } from "@/utils/rest-api";
import {
	type CreateResourceMediaTypeRequest,
	createResourceMediaTypeSchema,
	type UpdateResourceMediaTypeRequest,
	updateResourceMediaTypeSchema,
} from "./request";
import type { BackendResourceMediaType, ResourceMediaType } from "./response";

function transformResourceMediaType(
	backend: BackendResourceMediaType,
): ResourceMediaType {
	return {
		id: backend.id.toString(),
		name: backend.name,
		description: backend.description ?? null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		deletedAt: backend.deleted_at,
	};
}

export async function getResourceMediaTypes(options?: {
	filter?: "active" | "archived" | "all";
	page?: number;
	perPage?: number;
}): Promise<{ data: ResourceMediaType[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.filter) {
		params.append("filter", options.filter);
	}
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/media_types?${queryString}`
		: "v1/resources/media_types";

	const response = await restClient.get<
		BackendResourceMediaType[] | { data: BackendResourceMediaType[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResourceMediaType) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResourceMediaType),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

export async function getResourceMediaType(
	id: string,
): Promise<ResourceMediaType> {
	const response = await restClient.get<
		BackendResourceMediaType | { data: BackendResourceMediaType }
	>(`v1/resources/media_types/${id}`);

	const resourceMediaType =
		"data" in response ? response.data : (response as BackendResourceMediaType);

	return transformResourceMediaType(resourceMediaType);
}

export async function createResourceMediaType(
	data: CreateResourceMediaTypeRequest,
): Promise<ResourceMediaType> {
	const validated = createResourceMediaTypeSchema.parse(data);
	const response = await restClient.post<
		BackendResourceMediaType | { data: BackendResourceMediaType }
	>("v1/resources/media_types", { media_type: validated });

	const resourceMediaType =
		"data" in response ? response.data : (response as BackendResourceMediaType);

	return transformResourceMediaType(resourceMediaType);
}

export async function updateResourceMediaType(
	data: UpdateResourceMediaTypeRequest,
): Promise<ResourceMediaType> {
	const validated = updateResourceMediaTypeSchema.parse(data);
	const response = await restClient.put<
		BackendResourceMediaType | { data: BackendResourceMediaType }
	>(`v1/resources/media_types/${validated.id}`, {
		media_type: {
			name: validated.name,
			description: validated.description,
		},
	});

	const resourceMediaType =
		"data" in response ? response.data : (response as BackendResourceMediaType);

	return transformResourceMediaType(resourceMediaType);
}

export async function deleteResourceMediaType(id: string): Promise<void> {
	await restClient.delete(`v1/resources/media_types/${id}`);
}

export async function forceDeleteResourceMediaType(id: string): Promise<void> {
	await restClient.delete(`v1/resources/media_types/${id}/force_destroy`);
}

export async function restoreResourceMediaType(
	id: string,
): Promise<ResourceMediaType> {
	const response = await restClient.post<
		BackendResourceMediaType | { data: BackendResourceMediaType }
	>(`v1/resources/media_types/${id}/restore`);

	const resourceMediaType =
		"data" in response ? response.data : (response as BackendResourceMediaType);

	return transformResourceMediaType(resourceMediaType);
}