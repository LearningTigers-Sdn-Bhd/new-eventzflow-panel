import { restClient } from "@/utils/rest-api";
import {
	type CreateBoothPlanRequest,
	createBoothPlanSchema,
	type DeleteBoothPlanRequest,
	deleteBoothPlanSchema,
	type UpdateBoothPlanRequest,
	updateBoothPlanSchema,
} from "./request";
import type {
	BackendBoothPlan,
	BoothPlan,
	CreateBoothPlanResponse,
	DeleteBoothPlanResponse,
	UpdateBoothPlanResponse,
} from "./response";

function transformBoothPlan(backend: BackendBoothPlan): BoothPlan {
	return {
		id: backend.id,
		eventId: backend.event_id,
		name: backend.name,
		position: backend.position,
		active: backend.active,
		imageUrl: backend.image_url,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getBoothPlans(eventId: number): Promise<BoothPlan[]> {
	const response = await restClient.get<BackendBoothPlan[]>(
		`v1/events/${eventId}/booth_plans`,
	);

	return response.map(transformBoothPlan);
}

export async function createBoothPlan(
	data: CreateBoothPlanRequest,
): Promise<CreateBoothPlanResponse> {
	const validated = createBoothPlanSchema.parse(data);

	const formData = new FormData();
	formData.append("booth_plan[name]", validated.name);
	if (validated.position !== undefined) {
		formData.append("booth_plan[position]", String(validated.position));
	}
	if (validated.active !== undefined) {
		formData.append("booth_plan[active]", String(validated.active));
	}
	if (validated.image) {
		formData.append("booth_plan[image]", validated.image);
	}

	const response = await restClient.postFormData<BackendBoothPlan>(
		`v1/events/${validated.event_id}/booth_plans`,
		formData,
	);

	return { success: true, plan: transformBoothPlan(response) };
}

export async function updateBoothPlan(
	data: UpdateBoothPlanRequest,
): Promise<UpdateBoothPlanResponse> {
	const validated = updateBoothPlanSchema.parse(data);

	const formData = new FormData();
	formData.append("booth_plan[name]", validated.name);
	if (validated.position !== undefined) {
		formData.append("booth_plan[position]", String(validated.position));
	}
	if (validated.active !== undefined) {
		formData.append("booth_plan[active]", String(validated.active));
	}
	if (validated.image) {
		formData.append("booth_plan[image]", validated.image);
	}

	const response = await restClient.patchFormData<BackendBoothPlan>(
		`v1/events/${validated.event_id}/booth_plans/${validated.id}`,
		formData,
	);

	return { success: true, plan: transformBoothPlan(response) };
}

export async function deleteBoothPlan(
	data: DeleteBoothPlanRequest,
): Promise<DeleteBoothPlanResponse> {
	const validated = deleteBoothPlanSchema.parse(data);

	await restClient.delete(
		`v1/events/${validated.event_id}/booth_plans/${validated.id}`,
	);

	return { success: true };
}
