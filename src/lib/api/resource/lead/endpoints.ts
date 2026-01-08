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
		company: backend.company,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getResourceLeads(
	resourceId?: string,
): Promise<ResourceLead[]> {
	const url = resourceId
		? `v1/resources/leads?resource_id=${resourceId}`
		: "v1/resources/leads";
	const response = await restClient.get<BackendResourceLead[]>(url);
	return response.map(transformResourceLead);
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
	// Admin only
	return await restClient.get<ResourceLeadMetrics>(
		"v1/resources/leads/metrics",
	);
}
