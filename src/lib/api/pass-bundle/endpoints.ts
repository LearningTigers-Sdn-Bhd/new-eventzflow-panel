import { restClient } from "@/utils/rest-api";
import {
	type CreatePassBundleRequest,
	createPassBundleSchema,
	type DeletePassBundleRequest,
	deletePassBundleSchema,
	type GetEventPassBundlesRequest,
	type GetPassBundleRequest,
	getEventPassBundlesSchema,
	getPassBundleSchema,
	type UpdatePassBundleRequest,
	updatePassBundleSchema,
} from "./request";
import type {
	BackendPassBundle,
	CreatePassBundleResponse,
	DeletePassBundleResponse,
	PassBundle,
	UpdatePassBundleResponse,
} from "./response";

function transformPassBundle(backend: BackendPassBundle): PassBundle {
	return {
		id: backend.id,
		eventId: backend.event_id,
		name: backend.name,
		token: backend.token,
		passLimit: backend.pass_limit,
		usedCount: backend.used_count,
		remainingCount: backend.remaining_count,
		paymentMode: backend.payment_mode,
		paymentStatus: backend.payment_status,
		status: backend.status,
		expiresAt: backend.expires_at,
		registrationForm: backend.registration_form,
		ticketType: backend.ticket_type,
		planObject: backend.plan_object,
		bundleLink: backend.bundle_link,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
	};
}

export async function getEventPassBundles(
	data: GetEventPassBundlesRequest,
): Promise<PassBundle[]> {
	const validated = getEventPassBundlesSchema.parse(data);
	const response = await restClient.get<BackendPassBundle[]>(
		`v1/events/${validated.eventId}/pass_bundles`,
	);

	return response.map(transformPassBundle);
}

export async function getPassBundle(
	data: GetPassBundleRequest,
): Promise<PassBundle> {
	const validated = getPassBundleSchema.parse(data);
	const response = await restClient.get<BackendPassBundle>(
		`v1/events/${validated.eventId}/pass_bundles/${validated.passBundleId}`,
	);

	return transformPassBundle(response);
}

export async function createPassBundle(
	data: CreatePassBundleRequest,
): Promise<CreatePassBundleResponse> {
	const validated = createPassBundleSchema.parse(data);
	const { eventId, ...payload } = validated;
	const response = await restClient.post<BackendPassBundle>(
		`v1/events/${eventId}/pass_bundles`,
		{ pass_bundle: payload },
	);

	return transformPassBundle(response);
}

export async function updatePassBundle(
	data: UpdatePassBundleRequest,
): Promise<UpdatePassBundleResponse> {
	const validated = updatePassBundleSchema.parse(data);
	const { eventId, passBundleId, ...payload } = validated;
	const response = await restClient.patch<BackendPassBundle>(
		`v1/events/${eventId}/pass_bundles/${passBundleId}`,
		{ pass_bundle: payload },
	);

	return transformPassBundle(response);
}

export async function deletePassBundle(
	data: DeletePassBundleRequest,
): Promise<DeletePassBundleResponse> {
	const validated = deletePassBundleSchema.parse(data);
	await restClient.delete(
		`v1/events/${validated.eventId}/pass_bundles/${validated.passBundleId}`,
	);

	return { success: true };
}
