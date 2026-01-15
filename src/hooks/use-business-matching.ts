import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import {
	getAvailability,
	getBusinessMatchingEvents,
	getDetailedSlots,
    getBookings, // Added import
    createBooking,
    updateBooking, // Added
    type UpdateBookingRequest, // Added
	BusinessMatchingEvent,
    createAndAssignHost, // Added
    type CreateHostRequest, // Added
    removeHost, // Added
} from "@/lib/api/business-matching";

export const useRemoveHost = (eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bmEventId: string) => removeHost(eventId, bmEventId),
        onSuccess: () => {
            queryClient.refetchQueries({
                queryKey: ["business-matching-events", eventId],
            });
            // Also refetch the hosts list to update the table
            queryClient.refetchQueries({
                queryKey: ["business-matching-hosts", eventId],
            });
        },
    });
};

export const useCreateAndAssignHost = (eventId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bmEventId, data }: { bmEventId: string; data: CreateHostRequest }) =>
            createAndAssignHost(eventId, bmEventId, data),
        onSuccess: () => {
            // Refetch the main events query to show the new host immediately
            queryClient.refetchQueries({
                queryKey: ["business-matching-events", eventId],
            });
            // Also refetch the hosts list
            queryClient.refetchQueries({
                queryKey: ["business-matching-hosts", eventId],
            });
        },
    });
};

export const useBusinessMatchingEvents = (eventId: string) => {
	const queryResult = useQuery({
		queryKey: ["business-matching-events", eventId],
		queryFn: () => getBusinessMatchingEvents(eventId),
		enabled: !!eventId,
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
        retry: 1,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data as any).is_pending_async) {
                return 1000;
            }
            return false;
        },
	});

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
};

export const useForceRefreshBusinessMatching = (eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getBusinessMatchingEvents(eventId, true),
		onSuccess: (data) => {
            // Remove all related query data to ensure a fresh fetch
            queryClient.removeQueries({ queryKey: ["business-matching-events"] });
            queryClient.removeQueries({ queryKey: ["business-matching-bookings"] });
            queryClient.removeQueries({ queryKey: ["business-matching-availability"] });
            queryClient.removeQueries({ queryKey: ["business-matching-detailed-slots"] });

			queryClient.setQueryData(["business-matching-events", eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-events", eventId],
            });
            queryClient.invalidateQueries({ queryKey: ["business-matching-bookings"] });
            queryClient.invalidateQueries({ queryKey: ["business-matching-availability"] });
            queryClient.invalidateQueries({ queryKey: ["business-matching-detailed-slots"] });
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
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        retry: 1,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data as any).is_pending_async) {
                return 1000;
            }
            return false;
        },
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
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        retry: 1,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data as any).is_pending_async) {
                return 1000;
            }
            return false;
        },
	});

    const isAsyncPending = queryResult.data && (queryResult.data as any).is_pending_async === true;

    return { ...queryResult, isLoading: queryResult.isLoading || isAsyncPending, isFetching: queryResult.isFetching || isAsyncPending };
};

export const useBusinessMatchingBookings = (
    bmEventId: string | null,
    eventId: string | null
) => {
    const queryResult = useQuery({
        queryKey: ["business-matching-bookings", bmEventId, eventId],
        queryFn: () => {
            console.log("Fetching bookings for BM Event:", bmEventId, "Event:", eventId);
            return getBookings(bmEventId!, eventId!);
        },
        enabled: !!bmEventId && !!eventId,
        staleTime: 0,
        gcTime: 0, // Ensure data is not cached/persisted
        refetchOnMount: "always",
        retry: 1,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && (data as any).is_pending_async) {
                return 1000;
            }
            return false;
        },
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
            queryClient.removeQueries({ queryKey: ["business-matching-availability"] });
            queryClient.removeQueries({ queryKey: ["business-matching-detailed-slots"] });
			queryClient.setQueryData(["business-matching-availability", bmEventId, eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-availability", bmEventId, eventId],
            });
            queryClient.invalidateQueries({ queryKey: ["business-matching-detailed-slots"] }); // Also invalidate detailed slots.
		},
	});
};

export const useForceRefreshDetailedSlots = (bmEventId: string, date: string, eventId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => getDetailedSlots(bmEventId, date, eventId, true), // Pass true to forceRefresh
		onSuccess: (data) => {
            queryClient.removeQueries({ queryKey: ["business-matching-detailed-slots"] });
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
            queryClient.removeQueries({ queryKey: ["business-matching-bookings"] });
			queryClient.setQueryData(["business-matching-bookings", bmEventId, eventId], data);
            queryClient.invalidateQueries({
                queryKey: ["business-matching-bookings", bmEventId, eventId],
            });
		},
	});
};