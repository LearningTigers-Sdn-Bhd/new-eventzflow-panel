import { cache } from "react";
import { getPublicEventById } from "@/lib/api/event/endpoints";

export const getCachedPublicEvent = cache(async (eventSlug: string) =>
	getPublicEventById(eventSlug),
);
