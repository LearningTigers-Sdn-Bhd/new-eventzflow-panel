import { publicRestClient, restClient } from "@/utils/rest-api";
import {
	type CreateResourceLeadRequest,
	createResourceLeadSchema,
} from "./request";
import type {
	BackendResourceLead,
	ResourceLead,
	ResourceLeadMetrics,
} from "./response";

function transformResourceLead(backend: BackendResourceLead): ResourceLead {
	return {
		id: backend.id.toString(),
		resourceId: backend.resource_id.toString(),
		name: backend.name,
		email: backend.email,
		phone: backend.phone,
		company: backend.company_name,
		jobTitle: backend.job_title,
		state: backend.state,
		country: backend.country,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		resource: backend.resource
			? {
					id: backend.resource.id.toString(),
					title: backend.resource.title,
					slug: backend.resource.slug,
				}
			: undefined,
	};
}

export async function getResourceLeads(options?: {
	resourceId?: string;
	page?: number;
	perPage?: number;
}): Promise<{ data: ResourceLead[]; pagination?: any }> {
	const params = new URLSearchParams();
	if (options?.resourceId) params.append("resource_id", options.resourceId);
	if (options?.page) params.append("page", options.page.toString());
	if (options?.perPage) params.append("per_page", options.perPage.toString());

	const queryString = params.toString();
	const url = queryString
		? `v1/resources/leads?${queryString}`
		: "v1/resources/leads";

	const response = await restClient.get<
		BackendResourceLead[] | { data: BackendResourceLead[]; pagination?: any }
	>(url);

	if (Array.isArray(response)) {
		return { data: response.map(transformResourceLead) };
	}

	if (response && "data" in response && Array.isArray(response.data)) {
		return {
			data: response.data.map(transformResourceLead),
			pagination: response.pagination,
		};
	}

	return { data: [] };
}

export async function getResourceLead(id: string): Promise<ResourceLead> {
	const response = await restClient.get<BackendResourceLead>(
		`v1/resources/leads/${id}`,
	);
	return transformResourceLead(response);
}

export async function createResourceLead(
	data: CreateResourceLeadRequest,
): Promise<ResourceLead> {
	const validated = createResourceLeadSchema.parse(data);
	// Usually leads are created by visitors, so using publicRestClient if applicable,
	// but the plan says "Visitor (public action)".
	// Assuming we use the public client or standard client depending on context.
	// If it's a public form, it might not have auth headers.
	// However, the prompt implies "Visitor" role, but often these are public endpoints.
	// I'll stick to restClient for now assuming the frontend might be authenticated or the backend allows it.
	// Wait, `Visitor` usually means unauthenticated or generic user.
	// I will use publicRestClient if it exists, as I saw it imported in event/endpoints.ts

	const response = await publicRestClient.post<BackendResourceLead>(
		"v1/resources/leads",
		{ resource_lead: validated },
	);
	return transformResourceLead(response);
}

export async function getResourceLeadMetrics(): Promise<ResourceLeadMetrics> {
	// Admin only - backend wraps response in { success, message, data }
	const response = await restClient.get<{ data: ResourceLeadMetrics }>(
		"v1/resources/leads/metrics",
	);

	// Unwrap the data field from the backend response
	return response.data;
}
