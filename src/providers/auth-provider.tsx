"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { logout as authLogout, refreshToken } from "@/lib/api/auth";
import { type User, useUserSessionStore } from "@/stores/new-auth-store";

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that should NOT trigger silent auth refresh
// These are truly public pages that don't need authentication
// and should not interfere with auth state in other tabs
const NO_AUTH_REFRESH_ROUTES = [
	"/events/", // Public check-in pages: /events/[slug]/check-in
];

function shouldSkipAuthRefresh(pathname: string): boolean {
	return NO_AUTH_REFRESH_ROUTES.some((route) => pathname.startsWith(route));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const [isHydrated, setIsHydrated] = useState(false);
	const user = useUserSessionStore((state) => state.user);
	const sessionCredentials = useUserSessionStore(
		(state) => state.sessionCredentials,
	);
	const isTokenExpired = useUserSessionStore((state) => state.isTokenExpired);
	const pathname = usePathname();

	// We use this flag to prevent double-execution in strict mode
	const [isInitialized, setIsInitialized] = useState(false);

	// Wait for zustand persist hydration
	useEffect(() => {
		const unsubscribe = useUserSessionStore.persist.onFinishHydration(() => {
			setIsHydrated(true);
		});

		// Check if already hydrated
		if (useUserSessionStore.persist.hasHydrated()) {
			setIsHydrated(true);
		}

		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		const initAuth = async () => {
			// Wait for hydration before checking auth
			if (!isHydrated || isInitialized) return;

			// Skip auth refresh on truly public routes to prevent token rotation
			// that would invalidate sessions in other browser tabs
			if (shouldSkipAuthRefresh(pathname)) {
				setIsLoading(false);
				setIsInitialized(true);
				return;
			}

			// Only refresh if:
			// 1. No credentials exist (not logged in), OR
			// 2. Token is expired/expiring soon
			const needsRefresh = !sessionCredentials || isTokenExpired();

			if (needsRefresh) {
				try {
					// Attempt silent refresh using HttpOnly cookie
					await refreshToken();
				} catch (error) {
					// If refresh fails, we just stay unauthenticated.
					// No need to error out loudly, just user is not logged in.
					console.debug("Silent refresh failed or no session:", error);
				}
			}

			setIsLoading(false);
			setIsInitialized(true);
		};

		initAuth();
	}, [sessionCredentials, isInitialized, pathname, isHydrated, isTokenExpired]);

	const logout = async () => {
		setIsLoading(true);
		try {
			await authLogout();
			localStorage.removeItem("offline_tickets");
			localStorage.removeItem("offline_events");
			localStorage.removeItem("offline_last_synced");
		} finally {
			setIsLoading(false);
		}
	};

	const isAuthenticated = !!user && !!sessionCredentials;

	return (
		<AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
}
