"use client";

import { create } from "zustand";

export type ConfirmDialogType =
	| "base"
	| "success"
	| "warning"
	| "info"
	| "destructive";
export type ConfirmDialogIcon = "alert" | "check" | "delete" | "info";

export interface ConfirmDialogConfig {
	title?: string;
	description?: string; // Used for accessibility description (DialogDescription)
	size?: "md"; // Forced to md as per requirements
	showCloseButton?: boolean;
}

export interface ConfirmDialogProps {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	type?: ConfirmDialogType;
	rounded?: "rounded" | "no-rounded";
	icon?: ConfirmDialogIcon;
	onConfirm: () => void;
	onCancel: () => void;
}

export interface ConfirmDialogState {
	isOpen: boolean;
	props?: ConfirmDialogProps;
	config: ConfirmDialogConfig;
}

interface ConfirmDialogActions {
	openDialog: (params: {
		props: ConfirmDialogProps;
		config?: ConfirmDialogConfig;
	}) => void;
	closeDialog: () => void;
	resetDialog: () => void;
}

const initialState: ConfirmDialogState = {
	isOpen: false,
	props: undefined,
	config: {
		title: undefined,
		description: undefined,
		size: "md",
		showCloseButton: false, // Default hidden as per requirement 3.7
	},
};

export const useConfirmDialogStore = create<
	ConfirmDialogState & ConfirmDialogActions
>((set) => ({
	...initialState,

	openDialog: (params: {
		props: ConfirmDialogProps;
		config?: ConfirmDialogConfig;
	}) => {
		set({
			isOpen: true,
			props: params.props,
			config: {
				...initialState.config,
				...params.config,
			},
		});
	},

	closeDialog: () => {
		set((state) => ({
			...state,
			isOpen: false,
		}));
	},

	resetDialog: () => {
		set(initialState);
	},
}));
