import { useEffect, useState } from "react";
import { logout as authLogout } from "@/lib/api/auth";
import { useUserSessionStore } from "@/stores/new-auth-store";

/**
 * Auth hook that provides authentication state and actions
 * Uses the auth library functions for proper authentication management
 */
export function useAuth() {
	const user = useUserSessionStore((state) => state.user);
	const sessionCredentials = useUserSessionStore(
		(state) => state.sessionCredentials,
	);

	// Track hydration state properly
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		// Subscribe to hydration events and update state when hydration completes
		const unsubscribe = useUserSessionStore.persist.onHydrate(() => {
			setIsHydrated(true);
		});

		// Also check if already hydrated (in case hydration completes before this runs)
		const checkHydration = () => {
			if (useUserSessionStore.persist.hasHydrated()) {
				setIsHydrated(true);
			}
		};

		checkHydration();

		return unsubscribe;
	}, []);

	const isAuthenticated = !!user && !!sessionCredentials;
	const isLoading = false; // Mock loading state for now

	const logout = async () => {
		await authLogout();
		localStorage.removeItem("offline_tickets");
		localStorage.removeItem("offline_events");
		localStorage.removeItem("offline_last_synced");
	};

	return {
		user,
		isAuthenticated,
		isLoading,
		isHydrated,
		logout,
	};
}
