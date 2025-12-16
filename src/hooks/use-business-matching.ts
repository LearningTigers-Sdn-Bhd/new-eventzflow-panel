import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getAvailability,
	getBusinessMatchingEvents,
	getDetailedSlots,
    getBookings, // Added import
    createBooking,
    updateBooking, // Added
    type UpdateBookingRequest, // Added
	BusinessMatchingEvent,
} from "@/lib/api/business-matching";

export const useBusinessMatchingEvents = (eventId: string) => {
	const queryResult = useQuery({
		queryKey: ["business-matching-events", eventId],
		queryFn: () => getBusinessMatchingEvents(eventId),
		enabled: !!eventId,
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
	});

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
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
	const queryResult = useQuery({
		queryKey: ["business-matching-availability", bmEventId, eventId], // Update queryKey
		queryFn: () => getAvailability(bmEventId!, eventId!), // Pass eventId
		enabled: !!bmEventId && !!eventId, // Enable only if both are present
	});

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
};

export const useBusinessMatchingDetailedSlots = (
	bmEventId: string | null,
	date: string | null, // Date in "DD Month YYYY" format
	eventId: string | null // Changed from internalEventId
) => {
	const queryResult = useQuery({
		queryKey: ["business-matching-detailed-slots", bmEventId, date, eventId], // Update queryKey
		queryFn: () => getDetailedSlots(bmEventId!, date!, eventId!), // Pass eventId
		enabled: !!bmEventId && !!date && !!eventId,
	});

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
};

export const useBusinessMatchingBookings = (
    bmEventId: string | null,
    eventId: string | null
) => {
    const queryResult = useQuery({
        queryKey: ["business-matching-bookings", bmEventId, eventId], // Add forceRefresh to queryKey
        queryFn: () => getBookings(bmEventId!, eventId!), // Pass forceRefresh
        enabled: !!bmEventId && !!eventId,
    });

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
};

export const useUpdateBooking = (bmEventId: string, eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, data }: { bookingId: string; data: UpdateBookingRequest }) => 
            updateBooking(bmEventId, eventId, bookingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["business-matching-bookings", bmEventId, eventId],
            });
        },
    });
};

export const useForceRefreshAvailability = (bmEventId: string, eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getAvailability(bmEventId, eventId, true), // Pass true to forceRefresh
		onSuccess: (data) => {
			queryClient.setQueryData(["business-matching-availability", bmEventId, eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-availability", bmEventId, eventId],
            });
		},
	});
};

export const useForceRefreshDetailedSlots = (bmEventId: string, date: string, eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getDetailedSlots(bmEventId, date, eventId, true), // Pass true to forceRefresh
		onSuccess: (data) => {
			queryClient.setQueryData(["business-matching-detailed-slots", bmEventId, date, eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-detailed-slots", bmEventId, date, eventId],
            });
		},
	});
};

export const useForceRefreshBookings = (bmEventId: string, eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getBookings(bmEventId, eventId, true), // Pass true to forceRefresh
		onSuccess: (data) => {
			queryClient.setQueryData(["business-matching-bookings", bmEventId, eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-bookings", bmEventId, eventId],
            });
		},
	});
};
