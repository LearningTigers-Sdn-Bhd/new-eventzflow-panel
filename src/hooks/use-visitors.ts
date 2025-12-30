import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CreateVisitorRequest,
	createVisitor,
	deleteVisitor,
	getVisitor,
	getVisitors,
	type UpdateVisitorRequest,
	updateVisitor,
} from "@/lib/api/visitor";

/**
 * Hook to fetch all visitors for an event
 */
export const useVisitors = (eventId: number) => {
	return useQuery({
		queryKey: ["events", eventId, "visitors"],
		queryFn: () => getVisitors(eventId),
		enabled: !!eventId,
	});
};

/**
 * Hook to fetch a single visitor
 */
export const useVisitor = (eventId: number, visitorId: number) => {
	return useQuery({
		queryKey: ["events", eventId, "visitors", visitorId],
		queryFn: () => getVisitor(eventId, visitorId),
		enabled: !!eventId && !!visitorId,
	});
};

/**
 * Hook to create a new visitor
 */
export const useCreateVisitor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			data,
		}: {
			eventId: number;
			data: CreateVisitorRequest;
		}) => createVisitor(eventId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["events", variables.eventId, "visitors"],
			});
		},
	});
};

/**
 * Hook to update a visitor
 */
export const useUpdateVisitor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			visitorId,
			data,
		}: {
			eventId: number;
			visitorId: number;
			data: UpdateVisitorRequest;
		}) => updateVisitor(eventId, visitorId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["events", variables.eventId, "visitors"],
			});
			queryClient.invalidateQueries({
				queryKey: [
					"events",
					variables.eventId,
					"visitors",
					variables.visitorId,
				],
			});
		},
	});
};

/**
 * Hook to delete a visitor
 */
export const useDeleteVisitor = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			eventId,
			visitorId,
		}: {
			eventId: number;
			visitorId: number;
		}) => deleteVisitor(eventId, visitorId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["event", variables.eventId, "visitors"],
			});
		},
	});
};
