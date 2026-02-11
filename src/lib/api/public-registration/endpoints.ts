import { extractErrorMessage } from "@/utils/error-handler";
import { publicRestClient } from "@/utils/rest-api";
import type {
  CreatePublicRegistrationPayload,
  CreatePublicRegistrationResponse,
  PublicTicketTypesResponse,
} from "./types";

export async function getPublicTicketTypes(eventSlug: string) {
  try {
    const response = await publicRestClient.get<PublicTicketTypesResponse>(
      `v1/public/events/${eventSlug}/ticket_types`,
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
    const response = await publicRestClient.post<CreatePublicRegistrationResponse>(
      `v1/public/events/${eventSlug}/register`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    const message = await extractErrorMessage(error);
    throw new Error(message);
  }
}
