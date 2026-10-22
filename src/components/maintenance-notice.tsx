"use client";

import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import {
	getPublicSystemNoticeMessage,
	PUBLIC_SYSTEM_NOTICE_QUERY_KEY,
} from "@/lib/api/system-notice";
import { useBackendStatusStore } from "@/stores/backend-status-store";

const POLL_INTERVAL_MS = 60_000;

/**
 * Heads-up for a planned update, switched on by an org owner in Settings.
 * Hidden while the live "system update" banner is showing. Saving the notice
 * invalidates this query, so the editing tab updates immediately; other tabs
 * pick it up within a minute.
 */
export function MaintenanceNotice() {
	const unavailable = useBackendStatusStore((state) => state.unavailable);

	// On a failed poll (backend restarting) react-query keeps the last message.
	const { data: message } = useQuery({
		queryKey: PUBLIC_SYSTEM_NOTICE_QUERY_KEY,
		queryFn: getPublicSystemNoticeMessage,
		refetchInterval: POLL_INTERVAL_MS,
		meta: { suppressErrorToast: true },
	});

	if (!message || unavailable) return null;

	return (
		<div
			role="status"
			aria-live="polite"
			className="fixed inset-x-0 top-0 z-[99] flex items-center justify-center gap-2 border-sky-300 border-b bg-sky-100 px-4 py-2 text-center text-sky-950 text-sm dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100"
		>
			<Info className="h-4 w-4 shrink-0" aria-hidden="true" />
			<span>{message}</span>
		</div>
	);
}
