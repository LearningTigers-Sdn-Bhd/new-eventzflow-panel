import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateLeadRequest,
	createLead,
	getEventLeads,
	type UpdateLeadRequest,
	updateLead,
} from "@/lib/api/event-lead";

/**
 * Hook to create a lead (vendor scans attendee)
 */
export const useCreateLead = (eventId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateLeadRequest) => createLead(eventId, data),
		onSuccess: () => {
			// Invalidate lead queries
			queryClient.invalidateQueries({ queryKey: ["event-leads", eventId] });
			queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
		},
	});
};

/**
 * Hook to get all leads for an event
 */
export const useEventLeads = (eventId: string) => {
	return useQuery({
		queryKey: ["event-leads", eventId],
		queryFn: () => getEventLeads(eventId),
		enabled: !!eventId,
	});
};

/**
 * Hook to update notes on an existing lead
 */
export const useUpdateLead = (eventId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			leadId,
			data,
		}: {
			leadId: number;
			data: UpdateLeadRequest;
		}) => updateLead(eventId, leadId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["event-leads", eventId] });
		},
	});
};
