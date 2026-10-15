import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	id: number;
	email: string;
	full_name?: string | null | undefined;
	role:
		| "org_owner"
		| "organizer"
		| "member"
		| "vendor"
		| "exhibitor"
		| "exhibition_contractor";
	phone?: string | null | undefined;
	email_verified: boolean;
	// True if this user's ONLY standing on the platform is business_matching_admin
	// for one or more events — no org-level role, no event admin/team standing.
	is_pure_business_matching_admin?: boolean;
	business_matching_admin_event_ids?: string[];
}

interface SessionCredentials {
	accessToken: string;
	expiresAt: number;
	lastRefreshAt: number; // Track when we last successfully refreshed
}

interface UserSessionState {
	user: User | null;
	sessionCredentials: SessionCredentials | null;
	setUser: (user: User | null) => void;
	setSessionCredentials: (sessionCredentials: SessionCredentials) => void;
	removeSessionCredentials: () => void;
	isTokenExpired: () => boolean;
	isTokenExpiringSoon: () => boolean;
	canRefresh: () => boolean; // Prevent refresh spam - minimum time between refreshes
}

// Minimum time between refresh attempts to prevent spam (30 seconds)
// This prevents multiple tabs from hammering the refresh endpoint
const MIN_REFRESH_INTERVAL_MS = 30 * 1000;

// Refresh buffer: refresh when token expires in 2 minutes (instead of 5)
// This gives enough buffer for slow requests while not being too aggressive
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

const userSessionStoreSlice: StateCreator<
	UserSessionState,
	[["zustand/persist", unknown]]
> = (set, get) => ({
	user: null,
	sessionCredentials: null,
	setUser: (user: User | null) => set({ user }),
	setSessionCredentials: (sessionCredentials: SessionCredentials) =>
		set({ sessionCredentials }),
	removeSessionCredentials: () => set({ sessionCredentials: null, user: null }),
	isTokenExpired: () => {
		const credentials = get().sessionCredentials;
		if (!credentials) return true;
		return Date.now() >= credentials.expiresAt;
	},
	isTokenExpiringSoon: () => {
		const credentials = get().sessionCredentials;
		if (!credentials) return true;
		// Only consider expiring soon if within 2 minutes of expiry
		return credentials.expiresAt - Date.now() <= REFRESH_BUFFER_MS;
	},
	canRefresh: () => {
		const credentials = get().sessionCredentials;
		if (!credentials?.lastRefreshAt) return true;
		// Prevent refresh spam - minimum 30 seconds between refresh attempts
		return Date.now() - credentials.lastRefreshAt >= MIN_REFRESH_INTERVAL_MS;
	},
});

// Persisted session store - shares access token across tabs
// Note: Refresh token remains in HttpOnly cookie (secure)
// Access token is short-lived (15 min) so localStorage is acceptable
export const useUserSessionStore = create(
	persist<UserSessionState>(userSessionStoreSlice, {
		name: "user-session",
		partialize: (state) =>
			({
				user: state.user,
				sessionCredentials: state.sessionCredentials,
			}) as UserSessionState,
	}),
);

// Separate persisted store for non-sensitive user preferences
interface UserPreferences {
	lastLoggedInEmail: string | null;
	theme: "light" | "dark";
	setLastLoggedInEmail: (email: string) => void;
	setTheme: (theme: "light" | "dark") => void;
}

export const useUserPreferencesStore = create(
	persist<UserPreferences>(
		(set) => ({
			lastLoggedInEmail: null,
			theme: "light",
			setLastLoggedInEmail: (email) => set({ lastLoggedInEmail: email }),
			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "user-preferences",
		},
	),
);
