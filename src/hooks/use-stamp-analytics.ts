import { useQuery } from "@tanstack/react-query";
import { getStampCount } from "@/lib/api/stamp-analytics";

/**
 * Hook to fetch stamp analytics for a vendor
 */
export const useStampAnalytics = (eventId: number, vendorId: number) => {
	return useQuery({
		queryKey: ["stamp-analytics", eventId, vendorId],
		queryFn: () => getStampCount(eventId, vendorId),
		enabled: !!eventId && !!vendorId,
	});
};
