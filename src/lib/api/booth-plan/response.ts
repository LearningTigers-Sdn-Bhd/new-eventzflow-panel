export type BackendBoothPlan = {
	id: number;
	event_id: number;
	name: string;
	position: number;
	active: boolean;
	image_url: string | null;
	created_at: string;
	updated_at: string;
};

export type BoothPlan = {
	id: number;
	eventId: number;
	name: string;
	position: number;
	active: boolean;
	imageUrl: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateBoothPlanResponse = {
	success: boolean;
	plan: BoothPlan;
};

export type UpdateBoothPlanResponse = {
	success: boolean;
	plan: BoothPlan;
};

export type DeleteBoothPlanResponse = {
	success: boolean;
};
