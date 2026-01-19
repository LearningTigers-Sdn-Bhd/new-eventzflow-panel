import { restClient } from "@/utils/rest-api";
import { type CreatePlanRequest, type UpdatePlanRequest, type CreatePlanObjectRequest, type CreateAssignmentRequest } from "./request";
import { type Plan, type PlanObject, type TableAssignment } from "./response";

// Plans
export async function getPlans(eventId: string): Promise<Plan[]> {
  return restClient.get<Plan[]>(`v1/events/${eventId}/plans`);
}

export async function getPlan(planId: string): Promise<Plan> {
  return restClient.get<Plan>(`v1/plans/${planId}`);
}

export async function createPlan(eventId: string, data: CreatePlanRequest): Promise<Plan> {
  return restClient.post<Plan>(`v1/events/${eventId}/plans`, { plan: data });
}

export async function updatePlan(planId: string, data: UpdatePlanRequest): Promise<Plan> {
  return restClient.put<Plan>(`v1/plans/${planId}`, { plan: data });
}

export async function deletePlan(planId: string): Promise<void> {
  return restClient.delete(`v1/plans/${planId}`);
}

// Plan Objects
export async function createPlanObject(planId: string, data: CreatePlanObjectRequest): Promise<PlanObject> {
  return restClient.post<PlanObject>(`v1/plans/${planId}/plan_objects`, { plan_object: data });
}

export async function deletePlanObject(objectId: number | string): Promise<void> {
  return restClient.delete(`v1/plan_objects/${objectId}`);
}

export async function batchUpdatePlanObjects(planId: string, objects: Partial<PlanObject>[]): Promise<PlanObject[]> {
  return restClient.patch<PlanObject[]>(`v1/plans/${planId}/plan_objects/batch`, { plan_objects: objects });
}

// Assignments
export async function createAssignment(planId: string, data: CreateAssignmentRequest): Promise<TableAssignment> {
  return restClient.post<TableAssignment>(`v1/plans/${planId}/assignments`, data);
}

export async function deleteAssignment(ticketId: number | string): Promise<void> {
  return restClient.delete(`v1/assignments/${ticketId}`);
}

// Auto Distribute
export async function autoDistribute(planId: string): Promise<any> {
  return restClient.post(`v1/plans/${planId}/auto_distribute`, {});
}

// Export PDF
export async function exportPlanPdf(planId: string): Promise<Blob> {
  const response = await restClient.getBlob(`v1/plans/${planId}/export`);
  return response.blob;
}
