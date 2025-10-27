"use client";

import type { ReactNode } from "react";
import { useHydratedStore } from "@/hooks/use-hydrated-store";

interface AuthReadyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * Wrapper component that waits for the auth store to be hydrated
 * before rendering its children. This prevents components from
 * trying to access the auth token before it's loaded from localStorage.
 *
 * @example
 * <AuthReady>
 *   <DashboardPage />
 * </AuthReady>
 */
export function AuthReady({ children, fallback }: AuthReadyProps) {
	const isHydrated = useHydratedStore();

	if (!isHydrated) {
		return fallback || <div>Loading...</div>;
	}

	return <>{children}</>;
}
