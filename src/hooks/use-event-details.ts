// new-eventzflow-panel/src/hooks/use-event-details.ts
import { useQuery } from '@tanstack/react-query';
import { getPublicEventById, type PublicEventInfo } from '@/lib/api/event/endpoints';

export const useEventDetails = (eventId: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<PublicEventInfo, Error>({
    queryKey: ['event-details-public', eventId],
    queryFn: () => {
      if (!eventId) {
        // Return a resolved promise with a default/empty state if eventId is not available
        return Promise.resolve({ id: 0, title: 'Loading...', status: 'draft' } as unknown as PublicEventInfo); 
      }
      return getPublicEventById(eventId);
    },
    enabled: !!eventId && (options?.enabled ?? true),
  });
};
