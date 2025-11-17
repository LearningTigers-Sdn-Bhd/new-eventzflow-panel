import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVendor, type CreateVendorRequest } from "@/lib/api/vendor";

/**
 * Hook to create a new vendor user
 */
export const useCreateVendor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateVendorRequest) => createVendor(data),
		onSuccess: () => {
			// Invalidate team queries to refresh vendor list
			queryClient.invalidateQueries({ queryKey: ["team"] });
		},
	});
};
