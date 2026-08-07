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
	title?: React.ReactNode;
	description?: string;
	size?: DialogSize;
	showCloseButton?: boolean;
	className?: string; // Allow custom styling override
}

interface DialogFrame {
	content: React.ComponentType<Record<string, unknown>>;
	props?: Record<string, unknown>;
	config: DialogConfig;
}

export interface DialogState {
	isOpen: boolean;
	content: React.ComponentType<Record<string, unknown>> | null;
	props?: Record<string, unknown>;
	config: DialogConfig;
	history: DialogFrame[];
}

interface DialogActions {
	openDialog: <T = unknown>(params: {
		component: React.ComponentType<T>;
		props?: T;
		config?: DialogConfig;
	}) => void;
	closeDialog: () => void;
	resetDialog: () => void;
	goBack: () => void;
}

const initialConfig: DialogConfig = {
	title: undefined,
	description: undefined,
	size: "lg",
	showCloseButton: true,
};

const initialState: DialogState = {
	isOpen: false,
	content: null,
	props: undefined,
	config: initialConfig,
	history: [],
};

export const useDialogStore = create<DialogState & DialogActions>(
	(set, get) => ({
		...initialState,

		openDialog: <T = unknown>(params: {
			component: React.ComponentType<T>;
			props?: T;
			config?: DialogConfig;
		}) => {
			const current = get();
			// Opening a new dialog while one is already open is a "drill-down"
			// (e.g. a booking card opening a profile detail on top of the
			// bookings list) — remember it so goBack() can restore it.
			const history =
				current.isOpen && current.content
					? [
							...current.history,
							{
								content: current.content,
								props: current.props,
								config: current.config,
							},
						]
					: current.history;

			set({
				isOpen: true,
				content: params.component as React.ComponentType<
					Record<string, unknown>
				>,
				props: params.props as Record<string, unknown> | undefined,
				config: {
					...initialConfig,
					...params.config,
				},
				history,
			});
		},

		closeDialog: () => {
			set((state) => ({
				...state,
				isOpen: false,
				history: [],
			}));
		},

		resetDialog: () => {
			set(initialState);
		},

		goBack: () => {
			const { history } = get();
			if (history.length === 0) return;

			const previous = history[history.length - 1];
			set({
				isOpen: true,
				content: previous.content,
				props: previous.props,
				config: previous.config,
				history: history.slice(0, -1),
			});
		},
	}),
);
