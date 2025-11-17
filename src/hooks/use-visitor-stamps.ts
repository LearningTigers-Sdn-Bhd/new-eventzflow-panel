import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStamp, getEventStamps, type CreateStampRequest } from "@/lib/api/visitor-stamp";

/**
 * Hook to create a stamp (vendor scans visitor)
 */
export const useCreateStamp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			publicId,
			data,
		}: {
			publicId: string;
			data: CreateStampRequest;
		}) => createStamp(publicId, data),
		onSuccess: () => {
			// Invalidate stamp analytics queries
			queryClient.invalidateQueries({ queryKey: ["stamp-analytics"] });
			queryClient.invalidateQueries({ queryKey: ["visitor-stamps"] });
		},
	});
};

/**
 * Hook to get all visitor stamps for an event
 */
export const useEventStamps = (eventId: string) => {
	return useQuery({
		queryKey: ["visitor-stamps", eventId],
		queryFn: () => getEventStamps(eventId),
		enabled: !!eventId,
	});
};
