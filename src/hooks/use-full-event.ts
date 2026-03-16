// new-eventzflow-panel/src/hooks/use-full-event.ts
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/lib/api/event';
import type { EventDetails } from '@/lib/api/event/response';

export const useFullEvent = (eventId: string | number | undefined, options?: { enabled?: boolean }) => {
  return useQuery<EventDetails, Error>({
    queryKey: ['event-details-full', eventId],
    queryFn: () => {
      if (!eventId) {
        throw new Error("Event ID is required");
      }
      return getEventById(eventId.toString());
    },
    enabled: !!eventId && (options?.enabled ?? true),
  });
};
