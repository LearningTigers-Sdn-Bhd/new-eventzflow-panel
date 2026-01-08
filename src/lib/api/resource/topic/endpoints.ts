import { restClient } from "@/utils/rest-api";
import {
	type CreateResourceTopicRequest,
	createResourceTopicSchema,
	type UpdateResourceTopicRequest,
	updateResourceTopicSchema,
} from "./request";
import type { BackendResourceTopic, ResourceTopic } from "./response";

function transformResourceTopic(backend: BackendResourceTopic): ResourceTopic {
	return {
		id: backend.id.toString(),
		name: backend.name,
		description: backend.description ?? null,
		logo: backend.logo ?? null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		deletedAt: backend.deleted_at,
	};
}

export async function getResourceTopics(options?: {
	filter?: "active" | "archived" | "all";
	page?: number;
	perPage?: number;
}): Promise<{ data: ResourceTopic[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.filter) {
		params.append("filter", options.filter);
	}
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/topics?${queryString}`
		: "v1/resources/topics";

	const response = await restClient.get<
		BackendResourceTopic[] | { data: BackendResourceTopic[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResourceTopic) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResourceTopic),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

export async function getResourceTopic(id: string): Promise<ResourceTopic> {
	const response = await restClient.get<BackendResourceTopic>(
		`v1/resources/topics/${id}`,
	);
	return transformResourceTopic(response);
}

export async function createResourceTopic(
	data: CreateResourceTopicRequest,
): Promise<ResourceTopic> {
	const validated = createResourceTopicSchema.parse(data);
	const response = await restClient.post<
		BackendResourceTopic | { data: BackendResourceTopic }
	>("v1/resources/topics", { topic: validated });

	const resourceTopic =
		"data" in response ? response.data : (response as BackendResourceTopic);

	return transformResourceTopic(resourceTopic);
}

export async function updateResourceTopic(
	data: UpdateResourceTopicRequest,
): Promise<ResourceTopic> {
	const validated = updateResourceTopicSchema.parse(data);
	const response = await restClient.put<
		BackendResourceTopic | { data: BackendResourceTopic }
	>(`v1/resources/topics/${validated.id}`, {
		topic: {
			name: validated.name,
			description: validated.description,
			logo: validated.logo,
		},
	});

	const resourceTopic =
		"data" in response ? response.data : (response as BackendResourceTopic);

	return transformResourceTopic(resourceTopic);
}

export async function deleteResourceTopic(id: string): Promise<void> {
	await restClient.delete(`v1/resources/topics/${id}`);
}

export async function forceDeleteResourceTopic(id: string): Promise<void> {
	await restClient.delete(`v1/resources/topics/${id}/force_destroy`);
}

export async function restoreResourceTopic(id: string): Promise<ResourceTopic> {
	const response = await restClient.post<
		BackendResourceTopic | { data: BackendResourceTopic }
	>(`v1/resources/topics/${id}/restore`);

	const resourceTopic =
		"data" in response ? response.data : (response as BackendResourceTopic);

	return transformResourceTopic(resourceTopic);
}
