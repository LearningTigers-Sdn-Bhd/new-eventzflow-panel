import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getVendorProfile,
	updateVendorProfile,
	type UpdateVendorProfileRequest,
} from "@/lib/api/vendor-profile";

/**
 * Hook to fetch vendor profile
 */
export const useVendorProfile = (eventId: number, vendorId: number) => {
	return useQuery({
		queryKey: ["events", eventId, "vendors", vendorId, "profile"],
		queryFn: () => getVendorProfile(eventId, vendorId),
		enabled: !!eventId && !!vendorId,
	});
};

/**
 * Hook to update vendor profile
 */
export const useUpdateVendorProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			vendorId,
			data,
		}: {
			eventId: number;
			vendorId: number;
			data: UpdateVendorProfileRequest;
		}) => updateVendorProfile(eventId, vendorId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [
					"events",
					variables.eventId,
					"vendors",
					variables.vendorId,
					"profile",
				],
			});
		},
	});
};
