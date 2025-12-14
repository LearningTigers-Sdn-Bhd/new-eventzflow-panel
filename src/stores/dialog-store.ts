"use client";

import { create } from "zustand";

export type DialogSize =
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "3xl"
	| "4xl"
	| "5xl"
	| "full";

export interface DialogConfig {
	title?: string;
	description?: string;
	size?: DialogSize;
	showCloseButton?: boolean;
	className?: string; // Allow custom styling override
}

export interface DialogState {
	isOpen: boolean;
	content: React.ComponentType<Record<string, unknown>> | null;
	props?: Record<string, unknown>;
	config: DialogConfig;
}

interface DialogActions {
	openDialog: <T = unknown>(params: {
		component: React.ComponentType<T>;
		props?: T;
		config?: DialogConfig;
	}) => void;
	closeDialog: () => void;
	resetDialog: () => void;
}

const initialState: DialogState = {
	isOpen: false,
	content: null,
	props: undefined,
	config: {
		title: undefined,
		description: undefined,
		size: "lg",
		showCloseButton: true,
	},
};

export const useDialogStore = create<DialogState & DialogActions>((set) => ({
	...initialState,

	openDialog: <T = unknown>(params: {
		component: React.ComponentType<T>;
		props?: T;
		config?: DialogConfig;
	}) => {
		set({
			isOpen: true,
			content: params.component as React.ComponentType<Record<string, unknown>>,
			props: params.props as Record<string, unknown> | undefined,
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
