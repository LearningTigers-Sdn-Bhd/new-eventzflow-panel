import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getGroupAffiliates,
	createGroupAffiliate,
	deleteGroupAffiliate,
	type CreateAffiliateRequest,
} from "@/lib/api/group-affiliate";

/**
 * Hook to get all affiliates for a group
 */
export const useGroupAffiliates = (groupId: number) => {
	return useQuery({
		queryKey: ["groups", groupId, "affiliates"],
		queryFn: () => getGroupAffiliates(groupId),
	});
};

/**
 * Hook to assign a vendor to a group
 */
export const useCreateGroupAffiliate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			groupId,
			data,
		}: {
			groupId: number;
			data: CreateAffiliateRequest;
		}) => createGroupAffiliate(groupId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId],
			});
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId, "affiliates"],
			});
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});
};

/**
 * Hook to remove a vendor from a group
 */
export const useDeleteGroupAffiliate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ groupId, affiliateId }: { groupId: number; affiliateId: number }) => 
			deleteGroupAffiliate(groupId, affiliateId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["groups", variables.groupId] });
			queryClient.invalidateQueries({ 
				queryKey: ["groups", variables.groupId, "affiliates"] 
			});
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});
};
