import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth";
import {
	type CreateEventVendorRequest,
	createEventVendor,
	deleteEventVendor,
	getEventVendors,
} from "@/lib/api/event-vendor";

/**
 * Hook to fetch all vendors for an event
 */
export const useEventVendors = (eventId: number) => {
	return useQuery({
		queryKey: ["events", eventId, "vendors"],
		queryFn: () => getEventVendors(eventId),
		enabled: !!eventId,
	});
};

/**
 * Hook to add a vendor to an event
 */
export const useCreateEventVendor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			data,
		}: {
			eventId: number;
			data: CreateEventVendorRequest;
		}) => createEventVendor(eventId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["events", variables.eventId, "vendors"],
			});
		},
	});
};

/**
 * Hook to remove a vendor from an event
 */
export const useDeleteEventVendor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			vendorId,
		}: {
			eventId: number;
			vendorId: number;
		}) => deleteEventVendor(eventId, vendorId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["events", variables.eventId, "vendors"],
			});
		},
	});
};

/**
 * Hook to get the current user's event vendor ID for a specific event
 * Returns the event_vendor.id (not the user.id) which is needed for stamp creation
 */
export const useCurrentUserEventVendorId = (eventId: number) => {
	const { user } = useAuth();
	const { data: eventVendors, isLoading, error } = useEventVendors(eventId);

	// Find the event vendor record where vendor_id matches current user's id
	const currentUserEventVendor = eventVendors?.find(
		(ev) => ev.vendor_id === user?.id,
	);

	return {
		eventVendorId: currentUserEventVendor?.id,
		isLoading,
		error,
		isVendor: !!currentUserEventVendor,
	};
};
