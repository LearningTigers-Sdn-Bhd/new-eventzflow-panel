import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient } from "@/utils/rest-api";
import type {
	CreatePaymentOrderPayload,
	CreatePaymentOrderResponse,
	CreatePublicRegistrationPayload,
	CreatePublicRegistrationResponse,
	ExistingRegistrationStatusResponse,
	PublicRegistrationFormsResponse,
	PublicTicketDetailsResponse,
	PublicTicketTypesResponse,
	VerifyPaymentPayload,
	VerifyPaymentResponse,
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

export async function createPublicPaymentOrder(
	eventSlug: string,
	payload: CreatePaymentOrderPayload,
) {
	try {
		const response = await publicRestClient.post<CreatePaymentOrderResponse>(
			`v1/public/events/${eventSlug}/payments/create_order`,
			payload,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function verifyPublicPayment(
	eventSlug: string,
	payload: VerifyPaymentPayload,
) {
	try {
		const response = await publicRestClient.post<VerifyPaymentResponse>(
			`v1/public/events/${eventSlug}/payments/verify`,
			payload,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}

export async function getPublicTicketDetails(
	eventSlug: string,
	publicId: string,
) {
	try {
		const response = await publicRestClient.get<PublicTicketDetailsResponse>(
			`v1/public/events/${eventSlug}/tickets/${publicId}`,
		);
		return response.data;
	} catch (error: unknown) {
		const message = await extractErrorMessage(error);
		throw new Error(message);
	}
}
