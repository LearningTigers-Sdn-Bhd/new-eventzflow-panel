"use client";

import { useEffect } from "react";
import { useResourceActionsStore } from "@/stores/resource-actions-store";

export function useSetResourceActions(actions: React.ReactNode) {
	const setActions = useResourceActionsStore((state) => state.setActions);
	const clearActions = useResourceActionsStore((state) => state.clearActions);

	useEffect(() => {
		setActions(actions);
		return () => clearActions();
	}, [actions, setActions, clearActions]);
}
