"use client";

import type { DialogConfig, DialogSize } from "@/stores/dialog-store";
import { useDialogStore } from "@/stores/dialog-store";

export interface OpenDialogParams<T = unknown> {
	component: React.ComponentType<T>;
	props?: T;
	config?: DialogConfig;
}

export interface UseDialogReturn {
	openDialog: <T = unknown>(params: OpenDialogParams<T>) => void;
	closeDialog: () => void;
	resetDialog: () => void;
	isOpen: boolean;
}

/**
 * Custom hook for managing the universal dialog system.
 *
 * @example
 * ```tsx
 * const { openDialog } = useDialog();
 *
 * const handleEdit = () => {
 *   openDialog({
 *     component: EditUserForm,
 *     props: { userId: user.id },
 *     config: {
 *       title: "Edit User",
 *       size: "lg"
 *     }
 *   });
 * };
 * ```
 */
export function useDialog(): UseDialogReturn {
	const openDialog = useDialogStore((state) => state.openDialog);
	const closeDialog = useDialogStore((state) => state.closeDialog);
	const resetDialog = useDialogStore((state) => state.resetDialog);
	const isOpen = useDialogStore((state) => state.isOpen);

	return {
		openDialog,
		closeDialog,
		resetDialog,
		isOpen,
	};
}

// Export types for external use
export type { DialogConfig, DialogSize };
