import { publicRestClient, restClient } from "@/utils/rest-api";
import {
	type CreateResourceCategoryRequest,
	createResourceCategorySchema,
	type UpdateResourceCategoryRequest,
	updateResourceCategorySchema,
} from "./request";
import type { BackendResourceCategory, ResourceCategory } from "./response";

function transformResourceCategory(
	backend: BackendResourceCategory,
): ResourceCategory {
	return {
		id: backend.id.toString(),
		name: backend.name,
		slug: backend.slug,
		description: backend.description ?? null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		deletedAt: backend.deleted_at,
	};
}

export async function getResourceCategories(options?: {
	filter?: "active" | "archived" | "all";
	sort?: "most_published_resources";
	page?: number;
	perPage?: number;
}): Promise<{ data: ResourceCategory[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.filter) {
		params.append("filter", options.filter);
	}
	if (options?.sort) {
		params.append("sort", options.sort);
	}
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/categories?${queryString}`
		: "v1/resources/categories";

	const response = await publicRestClient.get<
		| BackendResourceCategory[]
		| { data: BackendResourceCategory[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResourceCategory) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResourceCategory),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

export async function getResourceCategory(
	id: string,
): Promise<ResourceCategory> {
	const response = await restClient.get<
		BackendResourceCategory | { data: BackendResourceCategory }
	>(`v1/resources/categories/${id}`);

	const resourceCategory =
		"data" in response ? response.data : (response as BackendResourceCategory);

	return transformResourceCategory(resourceCategory);
}

export async function createResourceCategory(
	data: CreateResourceCategoryRequest,
): Promise<ResourceCategory> {
	const validated = createResourceCategorySchema.parse(data);
	const response = await restClient.post<
		BackendResourceCategory | { data: BackendResourceCategory }
	>("v1/resources/categories", { category: validated });

	const resourceCategory =
		"data" in response ? response.data : (response as BackendResourceCategory);

	return transformResourceCategory(resourceCategory);
}

export async function updateResourceCategory(
	data: UpdateResourceCategoryRequest,
): Promise<ResourceCategory> {
	const validated = updateResourceCategorySchema.parse(data);
	const response = await restClient.put<
		BackendResourceCategory | { data: BackendResourceCategory }
	>(`v1/resources/categories/${validated.id}`, {
		category: {
			name: validated.name,
			description: validated.description,
		},
	});

	const resourceCategory =
		"data" in response ? response.data : (response as BackendResourceCategory);

	return transformResourceCategory(resourceCategory);
}

export async function deleteResourceCategory(id: string): Promise<void> {
	await restClient.delete(`v1/resources/categories/${id}`);
}

export async function forceDeleteResourceCategory(id: string): Promise<void> {
	await restClient.delete(`v1/resources/categories/${id}/force_destroy`);
}

export async function restoreResourceCategory(
	id: string,
): Promise<ResourceCategory> {
	const response = await restClient.post<
		BackendResourceCategory | { data: BackendResourceCategory }
	>(`v1/resources/categories/${id}/restore`);

	const resourceCategory =
		"data" in response ? response.data : (response as BackendResourceCategory);

	return transformResourceCategory(resourceCategory);
}
