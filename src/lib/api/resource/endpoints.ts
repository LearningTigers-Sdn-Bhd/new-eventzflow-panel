import { publicRestClient, restClient } from "@/utils/rest-api";
import type {
	BackendResourceCategory,
	ResourceCategory,
} from "./category/response";
import type {
	BackendResourceMediaType,
	ResourceMediaType,
} from "./media-type/response";
import {
	type ApprovalResourceRequest,
	approvalResourceSchema,
	type CreateResourceRequest,
	createResourceSchema,
	type UpdateResourceRequest,
	updateResourceSchema,
} from "./request";
import type {
	BackendResource,
	Resource,
	ResourceAuthor,
	ResourceBackendUser,
} from "./response";
import type { BackendResourceTopic, ResourceTopic } from "./topic/response";

function transformResource(backend: BackendResource): Resource {
	// Helper to transform relations if they exist
	const transformTopic = (t: BackendResourceTopic): ResourceTopic => ({
		id: t.id.toString(),
		name: t.name,
		slug: t.slug,
		description: t.description,
		logo: t.logo,
		createdAt: t.created_at,
		updatedAt: t.updated_at,
		deletedAt: t.deleted_at,
	});

	const transformCategory = (c: BackendResourceCategory): ResourceCategory => ({
		id: c.id.toString(),
		name: c.name,
		slug: c.slug,
		description: c.description,
		createdAt: c.created_at,
		updatedAt: c.updated_at,
		deletedAt: c.deleted_at,
	});

	const transformMediaType = (
		m: BackendResourceMediaType,
	): ResourceMediaType => ({
		id: m.id.toString(),
		name: m.name,
		slug: m.slug,
		description: m.description,
		createdAt: m.created_at,
		updatedAt: m.updated_at,
		deletedAt: m.deleted_at,
	});

	const transformAuthor = (u: ResourceBackendUser): ResourceAuthor => ({
		id: u.id.toString(),
		fullName: u.full_name,
		email: u.email,
		phone: u.phone,
		writePermission: u.write_permission
			? {
					status: u.write_permission.status,
					isOfficial: u.write_permission.is_official,
				}
			: undefined,
	});

	const transformHeaderImgUrl = (
		url: string | { large: string; original: string } | null,
	): string | null => {
		if (!url) return null;
		if (typeof url === "string") return url;
		return url.large || url.original;
	};

	return {
		id: backend.id.toString(),
		title: backend.title,
		slug: backend.slug,
		metaDescription: backend.meta_description ?? null,
		article: backend.article ?? null,
		status: backend.status,
		isGated: backend.is_gated,
		isOfficial: backend.is_official,
		rejectionReason: backend.rejection_reason ?? null,
		publishedAt: backend.published_at,
		headerImgUrl: transformHeaderImgUrl(backend.header_img_url),
        minRead: backend.min_read,

		topic: backend.topic ? transformTopic(backend.topic) : undefined,
		category: backend.category
			? transformCategory(backend.category)
			: undefined,
		mediaType: backend.media_type
			? transformMediaType(backend.media_type)
			: undefined,
		author: backend.author ? transformAuthor(backend.author) : undefined,
        suggestions: backend.suggestions ? backend.suggestions.map(transformResource) : undefined,

		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		deletedAt: backend.deleted_at,
	};
}

// Get all resources (Writer/My Content)
export async function getResources(options?: {
	status?: string;
	topicId?: string;
	categoryId?: string;
	mediaTypeId?: string;
	search?: string;
	page?: number;
	perPage?: number;
}): Promise<{ data: Resource[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.status) params.append("status", options.status);
	if (options?.topicId) params.append("resource_topic_id", options.topicId);
	if (options?.categoryId)
		params.append("resource_category_id", options.categoryId);
	if (options?.mediaTypeId)
		params.append("resource_media_type_id", options.mediaTypeId);
	if (options?.search) params.append("search", options.search);
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString ? `v1/resources?${queryString}` : "v1/resources";

	const response = await restClient.get<
		BackendResource[] | { data: BackendResource[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResource) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResource),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

// Get all resources for Owner (All Content)
export async function getResourcesOwner(options?: {
	status?: string;
	page?: number;
	perPage?: number;
}): Promise<{ data: Resource[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.status) params.append("status", options.status);
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/owner?${queryString}`
		: "v1/resources/owner";

	const response = await restClient.get<
		BackendResource[] | { data: BackendResource[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResource) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResource),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

// Get resources pending approval
export async function getApprovalResources(options?: {
	page?: number;
	perPage?: number;
}): Promise<{ data: Resource[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/approval_index?${queryString}`
		: "v1/resources/approval_index";

	const response = await restClient.get<
		BackendResource[] | { data: BackendResource[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResource) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResource),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

// Get single resource (Public view)
export async function getPublicResource(id: string): Promise<Resource> {
	const response = await publicRestClient.get<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${id}/public`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

// Get all resources (Public view)
export async function getPublicResources(options?: {
	priority?: number;
	priorityMin?: number;
	priorityMax?: number;
	topicSlug?: string;
	categorySlug?: string;
	mediaTypeSlug?: string;
	search?: string;
	page?: number;
	perPage?: number;
}): Promise<{ data: Resource[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.priority !== undefined)
		params.append("priority", options.priority.toString());
	if (options?.priorityMin !== undefined)
		params.append("priority_min", options.priorityMin.toString());
	if (options?.priorityMax !== undefined)
		params.append("priority_max", options.priorityMax.toString());
	if (options?.topicSlug) params.append("topic_slug", options.topicSlug);
	if (options?.categorySlug)
		params.append("category_slug", options.categorySlug);
	if (options?.mediaTypeSlug)
		params.append("media_type_slug", options.mediaTypeSlug);
	if (options?.search) params.append("search", options.search);
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/public?${queryString}`
		: "v1/resources/public";

	const response = await publicRestClient.get<
		BackendResource[] | { data: BackendResource[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResource) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResource),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

// Get featured resources (Homepage view - returns both featured and standard in one call)
export async function getFeaturedResources(): Promise<{
	featured: Resource[];
	standard: Resource[];
}> {
	const response = await publicRestClient.get<{
		data: {
			featured: BackendResource[];
			standard: BackendResource[];
		};
	}>("v1/resources/public?featured=true");

	return {
		featured: response.data.featured.map(transformResource),
		standard: response.data.standard.map(transformResource),
	};
}

// Get single resource (Admin/Dashboard view)
export async function getResource(id: string): Promise<Resource> {
	const response = await restClient.get<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${id}`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

// Get single resource by Slug (Public view likely, but here mostly for admin preview)
// If public, we might need a public endpoint or use publicRestClient.
// Assuming admin/panel context primarily here.
export async function getResourceBySlug(slug: string): Promise<Resource> {
	// Usually standard show can handle slug or id in Rails if friendly_id is used
	const response = await restClient.get<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${slug}`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

// Public fetch by slug
export async function getPublicResourceBySlug(slug: string): Promise<Resource> {
	const response = await publicRestClient.get<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${slug}/public`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

export async function incrementResourceView(id: string): Promise<void> {
	await publicRestClient.post(`v1/resources/${id}/increment_view`);
}

export async function createResource(
	data: CreateResourceRequest,
): Promise<Resource> {
	try {
		const validated = createResourceSchema.parse(data);

		const payload = {
			title: validated.title,
			meta_description: validated.metaDescription,
			article: validated.article,
			status: validated.status,
			resource_topic_id: validated.topicId,
			resource_category_id: validated.categoryId,
			resource_media_type_id: validated.mediaTypeId,
			is_gated: validated.isGated,
			is_official: validated.isOfficial,
		};

		if (validated.headerImg) {
			const formData = new FormData();
			Object.entries(payload).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					formData.append(`resource[${key}]`, value.toString());
				}
			});
			formData.append("resource[header_img]", validated.headerImg);

			const response = await restClient.postFormData<
				BackendResource | { data: BackendResource }
			>("v1/resources", formData);
			const resource =
				"data" in response ? response.data : (response as BackendResource);
			return transformResource(resource);
		}

		const response = await restClient.post<
			BackendResource | { data: BackendResource }
		>("v1/resources", {
			resource: payload,
		});

		const resource =
			"data" in response ? response.data : (response as BackendResource);

		return transformResource(resource);
	} catch (error) {
		console.error("Error creating resource:", error);
		throw error;
	}
}

export async function updateResource(
	data: UpdateResourceRequest,
): Promise<Resource> {
	try {
		const validated = updateResourceSchema.parse(data);
		const { id } = validated;

		const payload: Record<string, any> = {};
		if (validated.title !== undefined) payload.title = validated.title;
		if (validated.metaDescription !== undefined)
			payload.meta_description = validated.metaDescription;
		if (validated.article !== undefined) payload.article = validated.article;
		if (validated.status !== undefined) payload.status = validated.status;
		if (validated.topicId !== undefined)
			payload.resource_topic_id = validated.topicId;
		if (validated.categoryId !== undefined)
			payload.resource_category_id = validated.categoryId;
		if (validated.mediaTypeId !== undefined)
			payload.resource_media_type_id = validated.mediaTypeId;
		if (validated.isGated !== undefined) payload.is_gated = validated.isGated;

		if (validated.headerImg) {
			const formData = new FormData();
			Object.entries(payload).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					formData.append(`resource[${key}]`, value.toString());
				}
			});
			formData.append("resource[header_img]", validated.headerImg);

			// Rails handles multipart PATCH via POST with _method=PATCH or directly if configured
			// We'll use PATCH first as many modern setups handle it.
			const response = await restClient.patchFormData<
				BackendResource | { data: BackendResource }
			>(`v1/resources/${id}`, formData);
			const resource =
				"data" in response ? response.data : (response as BackendResource);
			return transformResource(resource);
		}

		const response = await restClient.patch<
			BackendResource | { data: BackendResource }
		>(`v1/resources/${id}`, {
			resource: payload,
		});

		const resource =
			"data" in response ? response.data : (response as BackendResource);

		return transformResource(resource);
	} catch (error) {
		console.error("Error updating resource:", error);
		throw error;
	}
}

export async function deleteResource(id: string): Promise<void> {
	await restClient.delete(`v1/resources/${id}`);
}

export async function forceDeleteResource(id: string): Promise<void> {
	await restClient.delete(`v1/resources/${id}/force_destroy`);
}

export async function restoreResource(id: string): Promise<Resource> {
	const response = await restClient.post<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${id}/restore`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

// Approval workflow
export async function approveResource(
	data: ApprovalResourceRequest,
): Promise<Resource> {
	const validated = approvalResourceSchema.parse(data);
	const response = await restClient.patch<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${validated.id}/approval`, {
		resource: {
			status: validated.status,
			rejection_reason: validated.rejection_reason,
		},
	});

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}

export async function duplicateResource(id: string): Promise<Resource> {
	const response = await restClient.post<
		BackendResource | { data: BackendResource }
	>(`v1/resources/${id}/duplicate`);

	const resource =
		"data" in response ? response.data : (response as BackendResource);

	return transformResource(resource);
}
