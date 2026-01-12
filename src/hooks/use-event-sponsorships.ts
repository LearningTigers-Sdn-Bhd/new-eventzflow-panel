import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventSponsorships,
  getEventSponsorship,
  createEventSponsorship,
  updateEventSponsorship,
  deleteEventSponsorship,
  getEventSponsorshipTiers,
  createEventSponsorshipTier,
  updateEventSponsorshipTier,
  deleteEventSponsorshipTier,
  getEventSponsorshipPayments,
  createEventSponsorshipPayment,
  updateEventSponsorshipPayment,
  deleteEventSponsorshipPayment,
  getEventSponsorshipAttachments,
  createEventSponsorshipAttachment,
  deleteEventSponsorshipAttachment,
  getEventSponsorshipItems,
  createEventSponsorshipItem,
  updateEventSponsorshipItem,
  deleteEventSponsorshipItem,
} from "@/lib/api/sponsorship/endpoints";
import type {
  EventSponsorship,
  EventSponsorshipTier,
  EventSponsorshipPayment,
  EventSponsorshipAttachment,
  EventSponsorshipItem,
} from "@/lib/api/sponsorship/response";

// --- Event Sponsorships ---

export function useEventSponsorships(eventId: string) {
  return useQuery({
    queryKey: ["event-sponsorships", eventId],
    queryFn: () => getEventSponsorships(eventId),
    enabled: !!eventId,
  });
}

export function useEventSponsorship(eventId: string, id: string) {
  return useQuery({
    queryKey: ["event-sponsorship", id],
    queryFn: () => getEventSponsorship(eventId, id),
    enabled: !!id && !!eventId,
  });
}

export function useCreateEventSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<EventSponsorship> }) =>
      createEventSponsorship(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships", eventId] });
    },
  });
}

export function useUpdateEventSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      id,
      data,
    }: { eventId: string; id: string; data: Partial<EventSponsorship> }) =>
      updateEventSponsorship(eventId, id, data),
    onSuccess: (data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", data.id.toString()] });
    },
  });
}

export function useDeleteEventSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, id }: { eventId: string; id: string }) =>
      deleteEventSponsorship(eventId, id),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships", eventId] });
    },
  });
}

// --- Event Sponsorship Tiers ---

export function useEventSponsorshipTiers(eventId: string) {
  return useQuery({
    queryKey: ["event-sponsorship-tiers", eventId],
    queryFn: () => getEventSponsorshipTiers(eventId),
    enabled: !!eventId,
  });
}

export function useCreateEventSponsorshipTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<EventSponsorshipTier> }) =>
      createEventSponsorshipTier(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-tiers", eventId] });
    },
  });
}

export function useUpdateEventSponsorshipTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      id,
      data,
    }: { eventId: string; id: string; data: Partial<EventSponsorshipTier> }) =>
      updateEventSponsorshipTier(eventId, id, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-tiers", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships", eventId] });
    },
  });
}

export function useDeleteEventSponsorshipTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, id }: { eventId: string; id: string }) =>
      deleteEventSponsorshipTier(eventId, id),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-tiers", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships", eventId] });
    },
  });
}

// --- Payments ---

export function useEventSponsorshipPayments(sponsorshipId: string) {
  return useQuery({
    queryKey: ["event-sponsorship-payments", sponsorshipId],
    queryFn: () => getEventSponsorshipPayments(sponsorshipId),
    enabled: !!sponsorshipId,
  });
}

export function useCreateEventSponsorshipPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, data }: { sponsorshipId: string; data: Partial<EventSponsorshipPayment> }) =>
      createEventSponsorshipPayment(sponsorshipId, data),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-payments", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] }); // Refresh status/totals
      // Also refresh the list where this sponsorship appears, ideally we need eventId but it's hard to get here directly unless passed
      // We can invalidate all event-sponsorships or be granular if we passed eventId.
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] }); 
    },
  });
}

export function useUpdateEventSponsorshipPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, id, data }: { sponsorshipId: string; id: string; data: Partial<EventSponsorshipPayment> }) =>
      updateEventSponsorshipPayment(sponsorshipId, id, data),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-payments", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] });
    },
  });
}

export function useDeleteEventSponsorshipPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, id }: { sponsorshipId: string; id: string }) =>
      deleteEventSponsorshipPayment(sponsorshipId, id),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-payments", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] });
    },
  });
}

// --- Attachments ---

export function useEventSponsorshipAttachments(sponsorshipId: string) {
  return useQuery({
    queryKey: ["event-sponsorship-attachments", sponsorshipId],
    queryFn: () => getEventSponsorshipAttachments(sponsorshipId),
    enabled: !!sponsorshipId,
  });
}

export function useCreateEventSponsorshipAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, data }: { sponsorshipId: string; data: FormData }) =>
      createEventSponsorshipAttachment(sponsorshipId, data),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-attachments", sponsorshipId] });
    },
  });
}

export function useDeleteEventSponsorshipAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, id }: { sponsorshipId: string; id: string }) =>
      deleteEventSponsorshipAttachment(sponsorshipId, id),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-attachments", sponsorshipId] });
    },
  });
}

// --- Items (In-Kind) ---

export function useEventSponsorshipItems(sponsorshipId: string) {
  return useQuery({
    queryKey: ["event-sponsorship-items", sponsorshipId],
    queryFn: () => getEventSponsorshipItems(sponsorshipId),
    enabled: !!sponsorshipId,
  });
}

export function useCreateEventSponsorshipItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, data }: { sponsorshipId: string; data: Partial<EventSponsorshipItem> }) =>
      createEventSponsorshipItem(sponsorshipId, data),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-items", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] });
    },
  });
}

export function useUpdateEventSponsorshipItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, id, data }: { sponsorshipId: string; id: string; data: Partial<EventSponsorshipItem> }) =>
      updateEventSponsorshipItem(sponsorshipId, id, data),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-items", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] });
    },
  });
}

export function useDeleteEventSponsorshipItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorshipId, id }: { sponsorshipId: string; id: string }) =>
      deleteEventSponsorshipItem(sponsorshipId, id),
    onSuccess: (_, { sponsorshipId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship-items", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorship", sponsorshipId] });
      queryClient.invalidateQueries({ queryKey: ["event-sponsorships"] });
    },
  });
}
