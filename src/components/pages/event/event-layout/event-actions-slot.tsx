"use client";

import { useEventActionsStore } from "@/stores/event-actions-store";

export function EventActionsSlot() {
	const actions = useEventActionsStore((state) => state.actions);
	return actions ? (
		<div className="flex items-center gap-3">{actions}</div>
	) : null;
}
