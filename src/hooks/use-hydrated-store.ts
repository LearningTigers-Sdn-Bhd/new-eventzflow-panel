import { useEffect, useState } from "react";
import { useUserSessionStore } from "@/stores/new-auth-store";

/**
 * Custom hook that automatically handles Zustand persist hydration
 * Returns true when the store has been hydrated from localStorage
 *
 * @example
 * const isHydrated = useHydratedStore();
 *
 * const { data } = useQuery({
 *   queryKey: ["events"],
 *   queryFn: getEventsOverview,
 *   enabled: isHydrated, // Wait for store to be ready
 * });
 */
export function useHydratedStore(): boolean {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		// Check if already hydrated
		if (useUserSessionStore.persist.hasHydrated()) {
			setIsHydrated(true);
			return;
		}

		// Listen for hydration event
		const unsubscribe = useUserSessionStore.persist.onHydrate(() => {
			setIsHydrated(true);
		});

		return unsubscribe;
	}, []);

	return isHydrated;
}
