import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addGroupMember,
	getGroupMembers,
	removeGroupMember,
	updateGroupMember,
	type AddMemberRequest,
	type UpdateMemberRequest,
} from "@/lib/api/group-member";

/**
 * Hook to fetch all members of a group
 */
export const useGroupMembers = (groupId: number) => {
	return useQuery({
		queryKey: ["groups", groupId, "members"],
		queryFn: () => getGroupMembers(groupId),
		enabled: !!groupId,
	});
};

/**
 * Hook to add a member to a group
 */
export const useAddGroupMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ groupId, data }: { groupId: number; data: AddMemberRequest }) =>
			addGroupMember(groupId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId, "members"],
			});
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId],
			});
		},
	});
};

/**
 * Hook to update a group member (toggle manager access)
 */
export const useUpdateGroupMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			groupId,
			memberId,
			data,
		}: {
			groupId: number;
			memberId: number;
			data: UpdateMemberRequest;
		}) => updateGroupMember(groupId, memberId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId, "members"],
			});
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId],
			});
		},
	});
};

/**
 * Hook to remove a member from a group
 */
export const useRemoveGroupMember = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ groupId, memberId }: { groupId: number; memberId: number }) =>
			removeGroupMember(groupId, memberId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId, "members"],
			});
			queryClient.invalidateQueries({
				queryKey: ["groups", variables.groupId],
			});
		},
	});
};
