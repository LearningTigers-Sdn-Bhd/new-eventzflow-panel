import { useCallback } from "react";

import ConfirmDialog from "@/components/admin-ui/form/confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
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
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	type?: ConfirmDialogType;
	rounded?: "rounded" | "no-rounded";
	icon?: ConfirmDialogIcon;
	size?: DialogSize;
	onConfirm: () => void;
	onCancel?: () => void;
}

/**
 * Shared helper for opening the reusable confirmation dialog.
 */
export function useConfirmDialog() {
	const { openDialog, closeDialog } = useDialog();

	const openConfirm = useCallback(
		({
			title,
			message,
			confirmLabel,
			cancelLabel,
			type = "base",
			rounded = "rounded",
			icon,
			size = "sm",
			onConfirm,
			onCancel,
		}: ConfirmDialogOptions) => {
			openDialog({
				component: ConfirmDialog,
				props: {
					message,
					confirmLabel,
					cancelLabel,
					type,
					rounded,
					icon,
					onConfirm,
					onCancel: onCancel ?? closeDialog,
				},
				config: {
					title,
					size,
				},
			});
		},
		[closeDialog, openDialog],
	);

	return { openConfirm, closeDialog };
}
