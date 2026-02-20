import { cache } from "react";
import { getPublicEventById } from "@/lib/api/event/endpoints";
import { getAllPublicSession } from "@/lib/api/seat-ticketing";

export const getCachedPublicEvent = cache(async (eventSlug: string) =>
	getPublicEventById(eventSlug),
);

export const getCachedPublicSessions = cache(async (eventSlug: string) =>
	getAllPublicSession({ eventSlug }),
);
