import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getVendorProfile,
	getVendorProfileById,
	type UpdateVendorProfileRequest,
	updateVendorProfile,
} from "@/lib/api/vendor-profile";

/**
 * Hook to fetch vendor profile
 * If vendorId is provided, fetches that vendor's profile, otherwise fetches current user's profile
 * @param vendorId - Optional vendor ID. If provided, fetches that vendor's profile. If undefined, fetches current user's profile.
 * @param enabled - Optional flag to control when the query should run. Defaults to true.
 */
export const useVendorProfile = (vendorId?: number, enabled = true) => {
	return useQuery({
		queryKey: ["vendor-profile", vendorId],
		queryFn: () =>
			vendorId ? getVendorProfileById(vendorId) : getVendorProfile(),
		enabled,
	});
};

/**
 * Hook to update vendor profile for the current authenticated vendor user
 */
export const useUpdateVendorProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateVendorProfileRequest) => updateVendorProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["vendor-profile"],
			});
		},
	});
};
