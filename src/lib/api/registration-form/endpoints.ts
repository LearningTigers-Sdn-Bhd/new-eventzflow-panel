import { restClient } from "@/utils/rest-api";
import {
	type CreateRegistrationFormRequest,
	createRegistrationFormSchema,
	type DeleteRegistrationFormRequest,
	deleteRegistrationFormSchema,
	type GetEventRegistrationFormsRequest,
	type GetRegistrationFormRequest,
	getEventRegistrationFormsSchema,
	getRegistrationFormSchema,
	type UpdateRegistrationFormRequest,
	updateRegistrationFormSchema,
} from "./request";
import type {
	BackendRegistrationForm,
	CreateRegistrationFormResponse,
	DeleteRegistrationFormResponse,
	RegistrationForm,
	UpdateRegistrationFormResponse,
} from "./response";

function normalizeRegistrationFormStatus(
	status: BackendRegistrationForm["status"],
): number {
	if (typeof status === "number") return status;
	return status === "active" ? 0 : 1;
}

function transformRegistrationForm(
	backend: BackendRegistrationForm,
): RegistrationForm {
	return {
		id: backend.id,
		eventId: backend.event_id,
		name: backend.name,
		slug: backend.slug,
		description: backend.description,
		customLabelsData: backend.custom_labels_data ?? [],
		status: normalizeRegistrationFormStatus(backend.status),
		position: backend.position,
		rsvpSetting: backend.registration_form_rsvp_setting
			? {
					id: backend.registration_form_rsvp_setting.id,
					registrationFormId:
						backend.registration_form_rsvp_setting.registration_form_id,
					enabled: backend.registration_form_rsvp_setting.enabled,
					rsvpRequired: backend.registration_form_rsvp_setting.rsvp_required,
					rsvpExpiresInHours:
						backend.registration_form_rsvp_setting.rsvp_expires_in_hours,
					reviewSlaHours:
						backend.registration_form_rsvp_setting.review_sla_hours,
					notifyByDate: backend.registration_form_rsvp_setting.notify_by_date,
					createdAt: backend.registration_form_rsvp_setting.created_at,
					updatedAt: backend.registration_form_rsvp_setting.updated_at,
				}
			: null,
		createdAt: backend.created_at,
		updatedAt: backend.updated_at,
		ticketTypes: backend.ticket_types.map((tt) => ({
			id: tt.id,
			name: tt.name,
			price: tt.price,
			status: tt.status,
			registrationMode: tt.registration_mode ?? "single",
			minAttendees: tt.min_attendees ?? 1,
			maxAttendees: tt.max_attendees ?? null,
			customLabelsData: tt.custom_labels_data ?? [],
		})),
	};
}

export async function getEventRegistrationForms(
	data: GetEventRegistrationFormsRequest,
): Promise<RegistrationForm[]> {
	try {
		const validated = getEventRegistrationFormsSchema.parse(data);

		const response = await restClient.get<BackendRegistrationForm[]>(
			`v1/events/${validated.eventId}/registration_forms`,
		);

		return response.map(transformRegistrationForm);
	} catch (error: any) {
		console.error("Error fetching registration forms:", error);
		throw new Error(error.message || "Failed to fetch registration forms");
	}
}

export async function getRegistrationForm(
	data: GetRegistrationFormRequest,
): Promise<RegistrationForm> {
	try {
		const validated = getRegistrationFormSchema.parse(data);

		const response = await restClient.get<BackendRegistrationForm>(
			`v1/events/${validated.eventId}/registration_forms/${validated.registrationFormId}`,
		);

		return transformRegistrationForm(response);
	} catch (error: any) {
		console.error("Error fetching registration form:", error);
		throw new Error(error.message || "Failed to fetch registration form");
	}
}

export async function createRegistrationForm(
	data: CreateRegistrationFormRequest,
): Promise<CreateRegistrationFormResponse> {
	try {
		const validated = createRegistrationFormSchema.parse(data);
		const { eventId, ...formData } = validated;

		const response = await restClient.post<BackendRegistrationForm>(
			`v1/events/${eventId}/registration_forms`,
			{ registration_form: formData },
		);

		return transformRegistrationForm(response);
	} catch (error: any) {
		console.error("Error creating registration form:", error);
		throw new Error(error.message || "Failed to create registration form");
	}
}

export async function updateRegistrationForm(
	data: UpdateRegistrationFormRequest,
): Promise<UpdateRegistrationFormResponse> {
	try {
		const validated = updateRegistrationFormSchema.parse(data);
		const { eventId, registrationFormId, ...updateData } = validated;

		const response = await restClient.put<BackendRegistrationForm>(
			`v1/events/${eventId}/registration_forms/${registrationFormId}`,
			{ registration_form: updateData },
		);

		return transformRegistrationForm(response);
	} catch (error: any) {
		console.error("Error updating registration form:", error);
		throw new Error(error.message || "Failed to update registration form");
	}
}

export async function deleteRegistrationForm(
	data: DeleteRegistrationFormRequest,
): Promise<DeleteRegistrationFormResponse> {
	try {
		const validated = deleteRegistrationFormSchema.parse(data);

		await restClient.delete(
			`v1/events/${validated.eventId}/registration_forms/${validated.registrationFormId}`,
		);

		return { success: true };
	} catch (error: any) {
		console.error("Error deleting registration form:", error);
		throw new Error(error.message || "Failed to delete registration form");
	}
}
