import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAvailability,
	getBusinessMatchingEvents,
	getDetailedSlots,
    getBookings, // Added import
	BusinessMatchingEvent,
} from "@/lib/api/business-matching";

export const useBusinessMatchingEvents = (eventId: string) => {
	return useQuery({
		queryKey: ["business-matching-events", eventId],
		queryFn: () => getBusinessMatchingEvents(eventId),
		enabled: !!eventId,
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
	});
};

export const useForceRefreshBusinessMatching = (eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getBusinessMatchingEvents(eventId, true),
		onSuccess: (data) => {
			queryClient.setQueryData(["business-matching-events", eventId], data);
		},
	});
};

export const useBusinessMatchingAvailability = (
	bmEventId: string | null,
	eventId: string | null // Changed from internalEventId
) => {
	return useQuery({
		queryKey: ["business-matching-availability", bmEventId, eventId], // Update queryKey
		queryFn: () => getAvailability(bmEventId!, eventId!), // Pass eventId
		enabled: !!bmEventId && !!eventId, // Enable only if both are present
	});
};

export const useBusinessMatchingDetailedSlots = (
	bmEventId: string | null,
	date: string | null, // Date in "DD Month YYYY" format
	eventId: string | null // Changed from internalEventId
) => {
	return useQuery({
		queryKey: ["business-matching-detailed-slots", bmEventId, date, eventId], // Update queryKey
		queryFn: () => getDetailedSlots(bmEventId!, date!, eventId!), // Pass eventId
		enabled: !!bmEventId && !!date && !!eventId,
	});
};

export const useBusinessMatchingBookings = (
    bmEventId: string | null,
    eventId: string | null
) => {
    return useQuery({
        queryKey: ["business-matching-bookings", bmEventId, eventId],
        queryFn: () => getBookings(bmEventId!, eventId!),
        enabled: !!bmEventId && !!eventId,
    });
};
