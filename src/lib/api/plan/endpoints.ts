import { restClient, publicRestClient } from "@/utils/rest-api";
import type {
	CreateAssignmentRequest,
	CreatePlanObjectRequest,
	CreatePlanRequest,
	UpdateAssignmentRequest,
	UpdatePlanRequest,
} from "./request";
import type {
	AutoDistributeResponse,
	Plan,
	PlanObject,
	TableAssignment,
} from "./response";

// Plans
export async function getPlans(eventId: string): Promise<Plan[]> {
	return restClient.get<Plan[]>(`v1/events/${eventId}/plans`);
}

export async function getPlan(planId: string): Promise<Plan> {
	return restClient.get<Plan>(`v1/plans/${planId}`);
}

export async function getPublicPlan(planId: string): Promise<Plan> {
	return publicRestClient.get<Plan>(`v1/public/plans/${planId}`);
}

export async function createPlan(
	eventId: string,
	data: CreatePlanRequest,
): Promise<Plan> {
	return restClient.post<Plan>(`v1/events/${eventId}/plans`, { plan: data });
}

export async function updatePlan(
	planId: string,
	data: UpdatePlanRequest,
): Promise<Plan> {
	if (data.background_image) {
		const formData = new FormData();
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && value !== null) {
				if (key === "background_image" && value instanceof File) {
					formData.append(`plan[${key}]`, value);
				} else {
					formData.append(`plan[${key}]`, String(value));
				}
			}
		}
		return restClient.putFormData<Plan>(`v1/plans/${planId}`, formData);
	}
	return restClient.put<Plan>(`v1/plans/${planId}`, { plan: data });
}

export async function deletePlan(planId: string): Promise<void> {
	return restClient.delete(`v1/plans/${planId}`);
}

// Plan Objects
export async function createPlanObject(
	planId: string,
	data: CreatePlanObjectRequest,
): Promise<PlanObject> {
	return restClient.post<PlanObject>(`v1/plans/${planId}/plan_objects`, {
		plan_object: data,
	});
}

export async function deletePlanObject(
	objectId: number | string,
): Promise<void> {
	return restClient.delete(`v1/plan_objects/${objectId}`, undefined);
}

export async function batchDeletePlanObjects(
	plan_id: string,
	objectIds: number[],
): Promise<void> {
	return restClient.delete(`v1/plans/${plan_id}/plan_objects/batch_destroy`, {
		ids: objectIds,
	});
}

export async function batchUpdatePlanObjects(
	planId: string,
	objects: Partial<PlanObject>[],
): Promise<PlanObject[]> {
	return restClient.patch<PlanObject[]>(
		`v1/plans/${planId}/plan_objects/batch`,
		{ plan_objects: objects },
	);
}

export async function batchCreatePlanObjects(
	plan_id: string,
	objects: CreatePlanObjectRequest[],
): Promise<PlanObject[]> {
	return restClient.post<PlanObject[]>(
		`v1/plans/${plan_id}/plan_objects/batch_create`,
		{ plan_objects: objects },
	);
}

// Assignments
export async function createAssignment(
	planId: string,
	data: CreateAssignmentRequest,
): Promise<TableAssignment> {
	return restClient.post<TableAssignment>(
		`v1/plans/${planId}/assignments`,
		data,
	);
}

export async function deleteAssignment(
	ticketId: number | string,
	planId?: string,
	visitorId?: number | string,
): Promise<void> {
	let path = `v1/assignments/${ticketId}`;
	const params = new URLSearchParams();
	if (planId) params.append("plan_id", planId);
	if (visitorId) params.append("visitor_id", String(visitorId));
	
	const queryString = params.toString();
	if (queryString) path += `?${queryString}`;
	
	return restClient.delete(path);
}

export async function updateAssignment(
	ticketOrVisitorId: number | string,
	data: UpdateAssignmentRequest,
	visitorId?: number | string,
	planId?: string,
): Promise<TableAssignment> {
	let path = `v1/assignments/${ticketOrVisitorId}`;
	const params = new URLSearchParams();
	if (planId) params.append("plan_id", planId);
	if (visitorId) params.append("visitor_id", String(visitorId));
	
	const queryString = params.toString();
	if (queryString) path += `?${queryString}`;
	
	return restClient.patch<TableAssignment>(path, { assignment: data });
}

// Auto Distribute
export async function autoDistribute(
	planId: string,
): Promise<AutoDistributeResponse> {
	return restClient.post<AutoDistributeResponse>(
		`v1/plans/${planId}/auto_distribute`,
		{},
	);
}

// Export PDF
export async function exportPlanPdf(
	planId: string,
	type?: "map" | "ops" | "public",
): Promise<Blob> {
	const response = await restClient.getBlob(
		`v1/plans/${planId}/export${type ? `?type=${type}` : ""}`,
	);
	return response.blob;
}
