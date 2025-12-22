import { useCallback } from "react";

import { useConfirmDialogStore } from "@/stores/confirm-dialog-store";
import type { DialogSize } from "@/stores/dialog-store";

type ConfirmDialogType =
	| "base"
	| "success"
	| "warning"
	| "info"
	| "destructive";
type ConfirmDialogIcon = "alert" | "check" | "delete" | "info";

export interface ConfirmDialogOptions {
	title?: string;
	description?: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	type?: ConfirmDialogType;
	/**
	 * Backwards-compatible alias for `type`.
	 */
	variant?: ConfirmDialogType;
	rounded?: "rounded" | "no-rounded";
	icon?: ConfirmDialogIcon;
	size?: DialogSize;
	showCloseButton?: boolean;
	onConfirm: () => void;
	onCancel?: () => void;
}

/**
 * Shared helper for opening the reusable confirmation dialog.
 */
export function useConfirmDialog() {
	const { openDialog, closeDialog } = useConfirmDialogStore();

	const openConfirm = useCallback(
		({
			title,
			description,
			message,
			confirmLabel,
			cancelLabel,
			type,
			variant,
			rounded = "rounded",
			icon,
			size, // Ignored as per requirements (always md)
			showCloseButton,
			onConfirm,
			onCancel,
		}: ConfirmDialogOptions) => {
			const dialogType = type ?? variant ?? "base";

			openDialog({
				props: {
					message,
					confirmLabel,
					cancelLabel,
					type: dialogType,
					rounded,
					icon,
					onConfirm,
					onCancel: onCancel ?? closeDialog,
				},
				config: {
					title,
					description,
					showCloseButton,
					// Force md size in store config or component, currently passed but component will ignore
				},
			});
		},
		[closeDialog, openDialog],
	);

	return { openConfirm, closeDialog };
}
