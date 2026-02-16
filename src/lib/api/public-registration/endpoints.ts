import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient } from "@/utils/rest-api";
import type {
	CreatePublicRegistrationPayload,
	CreatePublicRegistrationResponse,
	ExistingRegistrationStatusResponse,
	PublicRegistrationFormsResponse,
	PublicTicketTypesResponse,
} from "./types";

export async function getPublicRegistrationForms(eventSlug: string) {
	try {
		const response =
			await publicRestClient.get<PublicRegistrationFormsResponse>(
				`v1/public/events/${eventSlug}/registration_forms`,
			);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getPublicTicketTypes(
	eventSlug: string,
	formSlug?: string,
) {
	try {
		const params = formSlug ? `?form_slug=${encodeURIComponent(formSlug)}` : "";
		const response = await publicRestClient.get<PublicTicketTypesResponse>(
			`v1/public/events/${eventSlug}/ticket_types${params}`,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function createPublicRegistration(
	eventSlug: string,
	payload: CreatePublicRegistrationPayload,
) {
	try {
		const response =
			await publicRestClient.post<CreatePublicRegistrationResponse>(
				`v1/public/events/${eventSlug}/register`,
				payload,
			);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getPublicRegistrationStatus(
	eventSlug: string,
	email: string,
	formSlug?: string,
) {
	try {
		const query = new URLSearchParams({ email });
		if (formSlug) {
			query.set("form_slug", formSlug);
		}

		const response =
			await publicRestClient.get<ExistingRegistrationStatusResponse>(
				`v1/public/events/${eventSlug}/registration_status?${query.toString()}`,
			);

		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
