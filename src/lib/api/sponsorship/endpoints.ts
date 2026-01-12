import { restClient } from "@/utils/rest-api";
import type {
  Sponsor,
  EventSponsorship,
  EventSponsorshipTier,
  EventSponsorshipPayment,
  EventSponsorshipAttachment,
  EventSponsorshipItem,
} from "./response";

// --- Sponsors (Global) ---

export async function getSponsors(orgId?: string): Promise<Sponsor[]> {
  const query = orgId ? `?group_id=${orgId}` : "";
  return restClient.get<Sponsor[]>(`v1/sponsors${query}`);
}

export async function getSponsor(id: string): Promise<Sponsor> {
  return restClient.get<Sponsor>(`v1/sponsors/${id}`);
}

export async function createSponsor(data: Partial<Sponsor>): Promise<Sponsor> {
  return restClient.post<Sponsor>("v1/sponsors", { sponsor: data });
}

export async function updateSponsor(id: string, data: Partial<Sponsor>): Promise<Sponsor> {
  return restClient.put<Sponsor>(`v1/sponsors/${id}`, { sponsor: data });
}

export async function deleteSponsor(id: string): Promise<void> {
  return restClient.delete(`v1/sponsors/${id}`);
}

export async function lookupSponsors(search: string): Promise<Partial<Sponsor>[]> {
  return restClient.get<Partial<Sponsor>[]>(`v1/sponsors/lookup?search=${encodeURIComponent(search)}`);
}

// --- Event Sponsorship Tiers ---

export async function getEventSponsorshipTiers(eventId: string): Promise<EventSponsorshipTier[]> {
  return restClient.get<EventSponsorshipTier[]>(`v1/events/${eventId}/event_sponsorship_tiers`);
}

export async function createEventSponsorshipTier(eventId: string, data: Partial<EventSponsorshipTier>): Promise<EventSponsorshipTier> {
  return restClient.post<EventSponsorshipTier>(`v1/events/${eventId}/event_sponsorship_tiers`, { event_sponsorship_tier: data });
}

export async function updateEventSponsorshipTier(eventId: string, id: string, data: Partial<EventSponsorshipTier>): Promise<EventSponsorshipTier> {
  return restClient.put<EventSponsorshipTier>(`v1/events/${eventId}/event_sponsorship_tiers/${id}`, { event_sponsorship_tier: data });
}

export async function deleteEventSponsorshipTier(eventId: string, id: string): Promise<void> {
  return restClient.delete(`v1/events/${eventId}/event_sponsorship_tiers/${id}`);
}

// --- Event Sponsorships ---

export async function getEventSponsorships(eventId: string): Promise<EventSponsorship[]> {
  return restClient.get<EventSponsorship[]>(`v1/events/${eventId}/event_sponsorships`);
}

export async function getEventSponsorship(eventId: string, id: string): Promise<EventSponsorship> {
  return restClient.get<EventSponsorship>(`v1/events/${eventId}/event_sponsorships/${id}`);
}

export async function createEventSponsorship(eventId: string, data: Partial<EventSponsorship>): Promise<EventSponsorship> {
  return restClient.post<EventSponsorship>(`v1/events/${eventId}/event_sponsorships`, { event_sponsorship: data });
}

export async function updateEventSponsorship(eventId: string, id: string, data: Partial<EventSponsorship>): Promise<EventSponsorship> {
  return restClient.put<EventSponsorship>(`v1/events/${eventId}/event_sponsorships/${id}`, { event_sponsorship: data });
}

export async function deleteEventSponsorship(eventId: string, id: string): Promise<void> {
  return restClient.delete(`v1/events/${eventId}/event_sponsorships/${id}`);
}

// --- Event Sponsorship Payments ---

export async function getEventSponsorshipPayments(sponsorshipId: string): Promise<EventSponsorshipPayment[]> {
  return restClient.get<EventSponsorshipPayment[]>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_payments`);
}

export async function createEventSponsorshipPayment(sponsorshipId: string, data: Partial<EventSponsorshipPayment>): Promise<EventSponsorshipPayment> {
  return restClient.post<EventSponsorshipPayment>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_payments`, { event_sponsorship_payment: data });
}

export async function updateEventSponsorshipPayment(sponsorshipId: string, id: string, data: Partial<EventSponsorshipPayment>): Promise<EventSponsorshipPayment> {
  return restClient.put<EventSponsorshipPayment>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_payments/${id}`, { event_sponsorship_payment: data });
}

export async function deleteEventSponsorshipPayment(sponsorshipId: string, id: string): Promise<void> {
  return restClient.delete(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_payments/${id}`);
}

// --- Event Sponsorship Attachments ---

export async function getEventSponsorshipAttachments(sponsorshipId: string): Promise<EventSponsorshipAttachment[]> {
  return restClient.get<EventSponsorshipAttachment[]>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_attachments`);
}

export async function createEventSponsorshipAttachment(sponsorshipId: string, data: FormData): Promise<EventSponsorshipAttachment> {
  return restClient.postFormData<EventSponsorshipAttachment>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_attachments`, data);
}

export async function deleteEventSponsorshipAttachment(sponsorshipId: string, id: string): Promise<void> {
  return restClient.delete(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_attachments/${id}`);
}

// --- Event Sponsorship Items ---

export async function getEventSponsorshipItems(sponsorshipId: string): Promise<EventSponsorshipItem[]> {
  return restClient.get<EventSponsorshipItem[]>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_items`);
}

export async function createEventSponsorshipItem(sponsorshipId: string, data: Partial<EventSponsorshipItem>): Promise<EventSponsorshipItem> {
  return restClient.post<EventSponsorshipItem>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_items`, { event_sponsorship_item: data });
}

export async function updateEventSponsorshipItem(sponsorshipId: string, id: string, data: Partial<EventSponsorshipItem>): Promise<EventSponsorshipItem> {
  return restClient.put<EventSponsorshipItem>(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_items/${id}`, { event_sponsorship_item: data });
}

export async function deleteEventSponsorshipItem(sponsorshipId: string, id: string): Promise<void> {
  return restClient.delete(`v1/event_sponsorships/${sponsorshipId}/event_sponsorship_items/${id}`);
}
