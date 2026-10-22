"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { refreshToken } from "@/lib/api/auth";
import { useBackendStatusStore } from "@/stores/backend-status-store";
import { useUserSessionStore } from "@/stores/new-auth-store";
import { API_BASE_URL, queryClient } from "@/utils/rest-api";

const POLL_INTERVAL_MS = 5000;

/**
 * Shown while the backend is unreachable (typically a redeploy). Polls the
 * Rails health endpoint and, once it answers, restores the session and
 * refetches everything — no user action needed.
 */
export function SystemUpdateBanner() {
	const unavailable = useBackendStatusStore((state) => state.unavailable);

	useEffect(() => {
		if (!unavailable) return;

		let cancelled = false;
		let checking = false;

		const check = async () => {
			if (checking) return;
			checking = true;
			try {
				const res = await fetch(`${API_BASE_URL}/up`, { cache: "no-store" });
				if (!res.ok || cancelled) return;

				useBackendStatusStore.getState().setUnavailable(false);

				const session = useUserSessionStore.getState();
				if (session.sessionCredentials && session.isTokenExpiringSoon()) {
					await refreshToken().catch(() => {
						// refreshToken re-raises the banner if the backend is still down
					});
				}
				await queryClient.invalidateQueries();
			} catch {
				// Still unreachable — keep polling
			} finally {
				checking = false;
			}
		};

		const id = setInterval(check, POLL_INTERVAL_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [unavailable]);

	if (!unavailable) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 border-amber-300 border-b bg-amber-100 px-4 py-2 text-center text-amber-950 text-sm dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
		>
			<Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
			<span>
				<strong className="font-semibold">System update in progress.</strong>{" "}
				This takes a few minutes. Your data is safe and this page will reconnect
				on its own.
			</span>
		</div>
	);
}
