"use client";

import { usePathname } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { logout as authLogout, refreshToken } from "@/lib/api/auth";
import { type User, useUserSessionStore } from "@/stores/new-auth-store";

interface AuthContextType {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	logout: () => Promise<void>;
	forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that should NOT trigger silent auth refresh
// These are truly public pages that don't need authentication
// and should not interfere with auth state in other tabs
const NO_AUTH_REFRESH_ROUTES = [
	"/events/", // Public check-in pages: /events/[slug]/check-in
];

export async function handleAuthStorageChangeForAuthProvider(
	e: StorageEvent,
	refreshAttempted: React.MutableRefObject<boolean>,
	refresh: () => Promise<unknown> = refreshToken,
) {
	// Only react to changes in our session key
	if (e.key === "user-session" && e.newValue) {
		await useUserSessionStore.persist.rehydrate();

		// Another tab updated the session - re-check if we need to refresh
		const state = useUserSessionStore.getState();
		if (state.isTokenExpiringSoon() && !refreshAttempted.current) {
			refreshAttempted.current = true;
			refresh().catch(() => {
				// Silent fail - user will be logged out via 401 handlers if truly expired
			});
		}
	}
}

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
	// Track if we've already attempted refresh to prevent spam
	const refreshAttempted = useRef(false);

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

	// Handle auth initialization and silent refresh
	const initAuth = useCallback(async () => {
		// Wait for hydration before checking auth
		if (!isHydrated || isInitialized) return;

		// Skip auth refresh on truly public routes to prevent token rotation
		// that would invalidate sessions in other browser tabs
		if (shouldSkipAuthRefresh(pathname)) {
			setIsLoading(false);
			setIsInitialized(true);
			return;
		}

		// Check if we need to refresh:
		// 1. No credentials = not logged in, no refresh needed
		// 2. Token expired = refresh needed
		// 3. Token expiring soon = refresh needed (proactive)
		const needsRefresh =
			sessionCredentials &&
			(isTokenExpired() ||
				useUserSessionStore.getState().isTokenExpiringSoon());

		// Only attempt refresh once per mount (prevents refresh loops)
		if (needsRefresh && !refreshAttempted.current) {
			refreshAttempted.current = true;
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
	}, [sessionCredentials, isInitialized, pathname, isHydrated, isTokenExpired]);

	// Run init on mount and when relevant state changes
	useEffect(() => {
		initAuth();
	}, [initAuth]);

	// Listen for localStorage changes from other tabs (Zustand persist sync)
	// This ensures we re-check auth when another tab updates the session
	useEffect(() => {
		if (!isHydrated) return;

		const handleStorageChange = (e: StorageEvent) => {
			handleAuthStorageChangeForAuthProvider(e, refreshAttempted);
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [isHydrated]);

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

	// Force refresh token (exposed for manual use)
	const forceRefresh = async () => {
		refreshAttempted.current = true;
		await refreshToken();
	};

	const isAuthenticated = !!user && !!sessionCredentials;

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, isLoading, user, logout, forceRefresh }}
		>
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
