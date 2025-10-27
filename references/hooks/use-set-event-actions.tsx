"use client";

import { useEffect } from "react";
import { useEventActionsStore } from "@/stores/event-actions-store";

export function useSetEventActions(actions: React.ReactNode) {
	const setActions = useEventActionsStore((state) => state.setActions);
	const clearActions = useEventActionsStore((state) => state.clearActions);

	useEffect(() => {
		setActions(actions);
		return () => clearActions();
	}, [actions, setActions, clearActions]);
}
