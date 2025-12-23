// new-eventzflow-panel/src/hooks/use-business-matching-public.ts

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { 
    getBusinessHosts, 
    getHostAvailability, 
    getAvailability, // Added import
    getDetailedSlots, // Added import
    createPublicBooking,
    getBusinessMatchingEvents, 
    getPublicBusinessMatchingEvents, // Add this import
    BusinessHost,
    AvailabilityResponse,
    DetailedSlotsResponse, // Added import
    PublicCreateBookingRequest,
    BusinessMatchingEvent, 
    joinBusinessHost, // Added import
    getPublicBookingById, // Added import
    Booking
} from '@/lib/api/business-matching';

/**
 * Hook to fetch a single public booking's details.
 */
export const usePublicBookingDetails = (bookingId: string, bmEventId: string, eventId: string, options?: { enabled?: boolean }) => {
    return useQuery<Booking, Error>({
        queryKey: ['public-booking-details', bookingId, bmEventId, eventId],
        queryFn: async () => {
            if (!bookingId || !bmEventId || !eventId) {
                throw new Error("Missing ID for public booking details query.");
            }
            return getPublicBookingById(bookingId, bmEventId, eventId);
        },
        enabled: !!bookingId && !!bmEventId && !!eventId && (options?.enabled ?? true),
        staleTime: 0,
        gcTime: 0,
        retry: false,
    });
};

/**
 * Hook to fetch a list of business matching events for a specific event.
 */
export const useBusinessMatchingEvents = (eventId: string, options?: { enabled?: boolean }) => {
    return useQuery<BusinessMatchingEvent[], Error>({
        queryKey: ['business-matching-events-public', eventId], // Use distinct key
        queryFn: () => {
            if (!eventId) {
                return Promise.resolve([]); // Return empty array if eventId is not available
            }
            return getPublicBusinessMatchingEvents(eventId);
        },
        enabled: !!eventId && (options?.enabled ?? true),
    });
};

/**
 * Hook to fetch availability for a specific business matching event.
 */
export const useEventAvailability = (bmEventId: string, eventId: string, options?: { enabled?: boolean }) => {
    return useQuery<AvailabilityResponse, Error>({
        queryKey: ['business-matching-availability', bmEventId, eventId],
        queryFn: async () => {
            if (!bmEventId || !eventId) {
                throw new Error("bmEventId or eventId is missing for availability query.");
            }
            return getAvailability(bmEventId, eventId);
        },
        enabled: !!bmEventId && !!eventId && (options?.enabled ?? true),
        staleTime: 0, // Ensure data is always considered stale
        refetchOnMount: 'always', // Always refetch when component mounts
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data || (Array.isArray(data.dates) && data.dates.length === 0)) return 3000;
            return false;
        },
    });
};

/**
 * Hook to fetch detailed slots for a specific date.
 */
export const useDetailedSlots = (bmEventId: string, date: string, eventId: string, options?: { enabled?: boolean }) => {
    return useQuery<DetailedSlotsResponse, Error>({
        queryKey: ['business-matching-slots', bmEventId, date, eventId],
        queryFn: async () => {
            if (!bmEventId || !date || !eventId) {
                throw new Error("bmEventId, date or eventId is missing for detailed slots query.");
            }
            return getDetailedSlots(bmEventId, date, eventId);
        },
        enabled: !!bmEventId && !!date && !!eventId && (options?.enabled ?? true),
        staleTime: 0, // Ensure data is always considered stale
        refetchOnMount: 'always', // Always refetch when component mounts
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data || (Array.isArray(data.slots) && data.slots.length === 0)) return 3000;
            return false;
        },
    });
};

/**
 * Hook to fetch a list of business hosts for a specific event.
 */
export const useBusinessHosts = (eventId: string, options?: { enabled?: boolean }) => {
    return useQuery<BusinessHost[], Error>({
        queryKey: ['business-matching-hosts', eventId],
        queryFn: () => getBusinessHosts(eventId),
        enabled: !!eventId && (options?.enabled ?? true), // Only run the query if eventId is available and enabled is true (default)
    });
};

/**
 * Hook to fetch availability for a specific business host within an event.
 */
export const useHostAvailability = (eventId: string, hostUserId: string, options?: { enabled?: boolean }) => {
    return useQuery<AvailabilityResponse, Error>({
        queryKey: ['business-matching-host-availability', eventId, hostUserId],
        queryFn: () => getHostAvailability(eventId, hostUserId),
        enabled: !!eventId && !!hostUserId && (options?.enabled ?? true), // Only run if eventId, hostUserId are available and enabled is true
    });
};

/**
 * Hook to create a public booking.
 */
export const useCreatePublicBooking = () => {
    const queryClient = useQueryClient();
    return useMutation<Booking, Error, { bmEventId: string; eventId: string; hostUserId: string; data: PublicCreateBookingRequest }>({
        mutationFn: ({ bmEventId, eventId, hostUserId, data }) => 
            createPublicBooking(bmEventId, eventId, hostUserId, data),
        onSuccess: () => {
            // Invalidate relevant queries to refetch data after a successful booking
            queryClient.invalidateQueries({ queryKey: ['business-matching-host-availability'] });
            queryClient.invalidateQueries({ queryKey: ['business-matching-hosts'] });
            
            // Invalidate general availability and slots to ensure fresh data for next booking
            queryClient.invalidateQueries({ queryKey: ['business-matching-availability'] });
            queryClient.invalidateQueries({ queryKey: ['business-matching-slots'] });
            
            // Potentially invalidate other booking-related queries
        },
    });
};

/**
 * Hook to join as a business host.
 */
export const useJoinBusinessHost = () => {
    return useMutation<void, Error, { eventId: string; bmEventId: string }>({
        mutationFn: ({ eventId, bmEventId }) => joinBusinessHost(eventId, bmEventId),
    });
};