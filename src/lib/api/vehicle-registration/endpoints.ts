import { restClient } from "@/utils/rest-api";
import {
	type GetEventVehicleRegistrationsRequest,
	getEventVehicleRegistrationsSchema,
	type MoveVehicleGroupRequest,
	moveVehicleGroupSchema,
	type SyncVehicleBaseRequest,
	syncVehicleBaseSchema,
	type UpdateVehicleRequest,
	updateVehicleSchema,
	type VehicleIdRequest,
	vehicleIdSchema,
} from "./request";
import type {
	BackendVehicleRegistration,
	MoveVehicleGroupResponse,
	SyncVehicleBaseResponse,
	VehicleRegistration,
} from "./response";

function transformVehicleRegistration(
	backend: BackendVehicleRegistration,
): VehicleRegistration {
	return {
		id: backend.id,
		plate: backend.plate,
		deletedAt: backend.deleted_at ?? null,
		registrationForm: {
			id: backend.registration_form?.id ?? null,
			name: backend.registration_form?.name ?? null,
			slug: backend.registration_form?.slug ?? null,
		},
		baseTicketType: {
			id: backend.base_ticket_type?.id ?? null,
			name: backend.base_ticket_type?.name ?? null,
		},
		capacity: backend.capacity ?? null,
		seatsUsed: backend.seats_used,
		crew: (backend.crew ?? []).map((member) => ({
			ticketId: member.ticket_id,
			publicId: member.public_id,
			name: member.name,
			role: member.role ?? null,
			ticketTypeName: member.ticket_type_name ?? null,
			status: member.status,
			paymentStatus: member.payment_status,
		})),
		issues: (backend.issues ?? []).map((issue) => ({
			code: issue.code,
			message: issue.message,
			ticketId: issue.ticket_id,
		})),
	};
}

// Backend error bodies render staff-written messages in `errors` — surface the
// first one rather than ky's generic "Unprocessable Content".
async function errorMessage(error: unknown, fallback: string): Promise<Error> {
	if (error && typeof error === "object" && "response" in error) {
		try {
			const body = await (error as { response: Response }).response.json();
			const first = Array.isArray(body?.errors) ? body.errors[0] : null;
			if (first) return new Error(first);
		} catch {
			// fall through to the generic message
		}
	}
	return new Error(error instanceof Error ? error.message : fallback);
}

export async function getEventVehicleRegistrations(
	data: GetEventVehicleRegistrationsRequest,
): Promise<VehicleRegistration[]> {
	try {
		const validated = getEventVehicleRegistrationsSchema.parse(data);
		const searchParams = new URLSearchParams();
		if (validated.issuesOnly) searchParams.set("issues_only", "true");
		if (validated.q) searchParams.set("q", validated.q);
		if (validated.registrationFormId)
			searchParams.set(
				"registration_form_id",
				validated.registrationFormId.toString(),
			);
		if (validated.archived) searchParams.set("archived", validated.archived);
		const query = searchParams.toString();

		const response = await restClient.get<BackendVehicleRegistration[]>(
			`v1/events/${validated.eventId}/vehicle_registrations${query ? `?${query}` : ""}`,
		);
		return response.map(transformVehicleRegistration);
	} catch (error: unknown) {
		console.error("Error fetching vehicle registrations:", error);
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to fetch vehicle registrations",
		);
	}
}

export async function moveVehicleGroup(
	data: MoveVehicleGroupRequest,
): Promise<MoveVehicleGroupResponse> {
	try {
		const validated = moveVehicleGroupSchema.parse(data);
		const response = await restClient.patch<BackendVehicleRegistration>(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}/move_group`,
			{ registration_form_id: validated.registrationFormId },
		);
		return transformVehicleRegistration(response);
	} catch (error: unknown) {
		console.error("Error moving vehicle group:", error);
		throw await errorMessage(error, "Failed to move vehicle group");
	}
}

export async function syncVehicleBase(
	data: SyncVehicleBaseRequest,
): Promise<SyncVehicleBaseResponse> {
	try {
		const validated = syncVehicleBaseSchema.parse(data);
		const response = await restClient.patch<BackendVehicleRegistration>(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}/sync_base`,
		);
		return transformVehicleRegistration(response);
	} catch (error: unknown) {
		console.error("Error syncing vehicle base ticket:", error);
		throw await errorMessage(error, "Failed to sync vehicle base ticket");
	}
}

export async function updateVehicle(
	data: UpdateVehicleRequest,
): Promise<VehicleRegistration> {
	try {
		const validated = updateVehicleSchema.parse(data);
		const response = await restClient.patch<BackendVehicleRegistration>(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}`,
			{ plate: validated.plate },
		);
		return transformVehicleRegistration(response);
	} catch (error: unknown) {
		console.error("Error renaming vehicle:", error);
		throw await errorMessage(error, "Failed to rename vehicle");
	}
}

export async function archiveVehicle(
	data: VehicleIdRequest,
): Promise<VehicleRegistration> {
	try {
		const validated = vehicleIdSchema.parse(data);
		const response = await restClient.patch<BackendVehicleRegistration>(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}/archive`,
		);
		return transformVehicleRegistration(response);
	} catch (error: unknown) {
		console.error("Error archiving vehicle:", error);
		throw await errorMessage(error, "Failed to archive vehicle");
	}
}

export async function restoreVehicle(
	data: VehicleIdRequest,
): Promise<VehicleRegistration> {
	try {
		const validated = vehicleIdSchema.parse(data);
		const response = await restClient.patch<BackendVehicleRegistration>(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}/restore`,
		);
		return transformVehicleRegistration(response);
	} catch (error: unknown) {
		console.error("Error restoring vehicle:", error);
		throw await errorMessage(error, "Failed to restore vehicle");
	}
}

export async function deleteVehicle(data: VehicleIdRequest): Promise<void> {
	try {
		const validated = vehicleIdSchema.parse(data);
		await restClient.delete(
			`v1/events/${validated.eventId}/vehicle_registrations/${validated.vehicleRegistrationId}`,
		);
	} catch (error: unknown) {
		console.error("Error deleting vehicle:", error);
		throw await errorMessage(error, "Failed to delete vehicle");
	}
}
