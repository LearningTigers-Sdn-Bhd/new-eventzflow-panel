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
}

interface SessionCredentials {
	accessToken: string;
	expiresAt: number;
}

interface UserSessionState {
	user: User | null;
	sessionCredentials: SessionCredentials | null;
	setUser: (user: User | null) => void;
	setSessionCredentials: (sessionCredentials: SessionCredentials) => void;
	removeSessionCredentials: () => void;
	isTokenExpired: () => boolean;
	isTokenExpiringSoon: () => boolean;
}

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
		const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
		return credentials.expiresAt - Date.now() <= fiveMinutes;
	},
});

// Persisted session store - shares access token across tabs
// Note: Refresh token remains in HttpOnly cookie (secure)
// Access token is short-lived (15 min) so localStorage is acceptable
export const useUserSessionStore = create(
	persist<UserSessionState>(userSessionStoreSlice, {
		name: "user-session",
		partialize: (state) => ({
			user: state.user,
			sessionCredentials: state.sessionCredentials,
		}),
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
