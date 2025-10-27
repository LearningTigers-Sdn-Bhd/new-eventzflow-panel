import { useAuthStore } from "@/stores/auth-store";
import { queryClient } from "@/utils/trpc";

export function useAuth() {
    const authStore = useAuthStore();

    const login = async (credentials: { email: string; password: string }) => {
        await authStore.login(credentials);
    };

    const register = async (data: {
        email: string;
        password: string;
        password_confirmation: string;
        full_name: string;
        phone?: string;
    }) => {
        await authStore.register(data);
    };

    const logout = async () => {
        try {
            await authStore.logout();
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            queryClient.clear();
            // Force redirect to home page and clear any cached data
            window.location.href = "/";
        }
    };
    const refresh = async () => {
        await authStore.refresh();
    };

    return {
        user: authStore.user,
        accessToken: authStore.accessToken,
        refreshToken: authStore.refreshToken,
        isLoading: authStore.isLoading,
        isHydrated: authStore.isHydrated,
        isAuthenticated:
            authStore.isHydrated && !!authStore.accessToken && !!authStore.user,
        error: authStore.error,
        login,
        register,
        logout,
        refresh,
        updateUser: authStore.updateUser,
        clearError: authStore.clearError,
    };
}
