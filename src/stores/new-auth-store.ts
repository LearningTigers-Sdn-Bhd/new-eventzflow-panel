import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

interface User {
	id: number;
	email: string;
	full_name?: string | null | undefined;
	role: "org_owner" | "organizer" | "member";
	phone?: string | null | undefined;
	email_verified: boolean;
}

interface SessionCredentials {
	accessToken: string;
	refreshToken: string;
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

const userSessionStoreSlice: StateCreator<UserSessionState> = (set, get) => ({
	user: null,
	sessionCredentials: null,
	setUser: (user: User | null) => set({ user }),
	setSessionCredentials: (sessionCredentials: SessionCredentials) =>
		set({ sessionCredentials }),
	removeSessionCredentials: () => set({ sessionCredentials: null }),
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

const persistedUserSessionStore = persist<UserSessionState>(
	userSessionStoreSlice,
	{
		name: "user-session",
	},
);

export const useUserSessionStore = create(persistedUserSessionStore);
