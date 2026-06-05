import { restClient } from "@/utils/rest-api";
import {
	type GetRegistrationFormRsvpSettingRequest,
	getRegistrationFormRsvpSettingSchema,
	type UpdateRegistrationFormRsvpSettingRequest,
	updateRegistrationFormRsvpSettingSchema,
} from "./request";
import type { RegistrationFormRsvpSetting } from "./response";

export async function getRegistrationFormRsvpSetting(
	data: GetRegistrationFormRsvpSettingRequest,
): Promise<RegistrationFormRsvpSetting> {
	const validated = getRegistrationFormRsvpSettingSchema.parse(data);
	return restClient.get<RegistrationFormRsvpSetting>(
		`v1/events/${validated.eventId}/registration_forms/${validated.registrationFormId}/rsvp_setting`,
	);
}

export async function updateRegistrationFormRsvpSetting(
	data: UpdateRegistrationFormRsvpSettingRequest,
): Promise<RegistrationFormRsvpSetting> {
	const validated = updateRegistrationFormRsvpSettingSchema.parse(data);
	const { eventId, registrationFormId, ...payload } = validated;

	return restClient.put<RegistrationFormRsvpSetting>(
		`v1/events/${eventId}/registration_forms/${registrationFormId}/rsvp_setting`,
		{ registration_form_rsvp_setting: payload },
	);
}
