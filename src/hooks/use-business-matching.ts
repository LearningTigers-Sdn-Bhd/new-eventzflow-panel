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
} from "@/lib/api/business-matching";

export const useBusinessMatchingEvents = (eventId: string) => {
	const queryResult = useQuery({
		queryKey: ["business-matching-events", eventId],
		queryFn: () => getBusinessMatchingEvents(eventId),
		enabled: !!eventId,
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
        refetchInterval: (query) => {
            const data = query.state.data;
            // Poll if data is empty array (likely pending async)
            if (Array.isArray(data) && data.length === 0) return 3000;
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
    const isFirstRun = useRef(true);
	const queryResult = useQuery({
		queryKey: ["business-matching-availability", bmEventId, eventId], // Update queryKey
		queryFn: () => {
            const force = isFirstRun.current;
            if (force) {
                isFirstRun.current = false;
            }
            return getAvailability(bmEventId!, eventId!, force);
        }, // Pass eventId
		enabled: !!bmEventId && !!eventId, // Enable only if both are present
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && Array.isArray(data.dates) && data.dates.length === 0) return 3000;
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
    const isFirstRun = useRef(true);
	const queryResult = useQuery({
		queryKey: ["business-matching-detailed-slots", bmEventId, date, eventId], // Update queryKey
		queryFn: () => {
            const force = isFirstRun.current;
            if (force) {
                isFirstRun.current = false;
            }
            return getDetailedSlots(bmEventId!, date!, eventId!, force);
        }, // Pass eventId
		enabled: !!bmEventId && !!date && !!eventId,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: "always",
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && Array.isArray(data.slots) && data.slots.length === 0) return 3000;
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
    const isFirstRun = useRef(true);

    const queryResult = useQuery({
        queryKey: ["business-matching-bookings", bmEventId, eventId], // Add forceRefresh to queryKey
        queryFn: () => {
            const force = isFirstRun.current;
            if (force) {
                isFirstRun.current = false;
            }
            console.log("Fetching bookings for BM Event:", bmEventId, "Event:", eventId, "Force:", force);
            return getBookings(bmEventId!, eventId!, force);
        },
        enabled: !!bmEventId && !!eventId,
        staleTime: 0,
        gcTime: 0, // Ensure data is not cached/persisted
        refetchOnMount: "always",
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data && Array.isArray(data.bookings) && data.bookings.length === 0) return 3000;
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