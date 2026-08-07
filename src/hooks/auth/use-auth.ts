import { useAuthContext } from "@/providers/auth-provider";

export function useAuth() {
	const { user, isAuthenticated, isLoading, logout, forceRefresh } =
		useAuthContext();

	return {
		user,
		isAuthenticated,
		isLoading,
		logout,
		forceRefresh,
		isInitialized: !isLoading,
		// True if the user's ONLY standing on the platform is business_matching_admin —
		// they should never see the generic app nav/dashboard, only Business Matching.
		isPureBusinessMatchingAdmin: user?.is_pure_business_matching_admin ?? false,
		businessMatchingAdminEventIds:
			user?.business_matching_admin_event_ids ?? [],
	};
}
