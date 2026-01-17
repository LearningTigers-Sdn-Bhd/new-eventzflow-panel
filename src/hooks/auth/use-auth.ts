import { useAuthContext } from "@/providers/auth-provider";

export function useAuth() {
	const { user, isAuthenticated, isLoading, logout } = useAuthContext();

	return {
		user,
		isAuthenticated,
		isLoading,
		logout,
		isInitialized: !isLoading,
	};
}
