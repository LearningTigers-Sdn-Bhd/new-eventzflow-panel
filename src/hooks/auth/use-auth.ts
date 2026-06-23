import { useAuthContext } from "@/providers/auth-provider";

export function useAuth() {
	const { user, isAuthenticated, isLoading, logout, forceRefresh } = useAuthContext();

	return {
		user,
		isAuthenticated,
		isLoading,
		logout,
		forceRefresh,
		isInitialized: !isLoading,
	};
}
