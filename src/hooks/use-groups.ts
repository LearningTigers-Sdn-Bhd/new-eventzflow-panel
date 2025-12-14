import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateGroupRequest,
	createGroup,
	deleteGroup,
	getGroup,
	getGroups,
	type UpdateGroupRequest,
	updateGroup,
} from "@/lib/api/group";

/**
 * Hook to fetch all groups
 */
export const useGroups = () => {
	return useQuery({
		queryKey: ["groups"],
		queryFn: getGroups,
	});
};

/**
 * Hook to fetch a single group with members
 */
export const useGroup = (id: number) => {
	return useQuery({
		queryKey: ["groups", id],
		queryFn: () => getGroup(id),
		enabled: !!id,
	});
};

/**
 * Hook to create a new group
 */
export const useCreateGroup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateGroupRequest) => createGroup(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});
};

/**
 * Hook to update a group
 */
export const useUpdateGroup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateGroupRequest }) =>
			updateGroup(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["groups"] });
			queryClient.invalidateQueries({ queryKey: ["groups", variables.id] });
		},
	});
};

/**
 * Hook to delete a group
 */
export const useDeleteGroup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => deleteGroup(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});
};
