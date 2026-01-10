"use client";

import type { Editor } from "@tiptap/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export interface RichTextEditorContextValue {
	editor: Editor | null;
	disabledExtensions: string[];
	disabledGroups: string[];
	hasOutline: boolean;
	setHasOutline: (value: boolean) => void;
	outlineVisible: boolean;
	setOutlineVisible: (value: boolean) => void;
	toggleOutline: () => void;
}

const RichTextEditorContext = createContext<RichTextEditorContextValue | null>(
	null,
);

export function useRichTextEditorContext() {
	const context = useContext(RichTextEditorContext);
	if (!context) {
		throw new Error(
			"useRichTextEditorContext must be used within a RichTextEditor",
		);
	}
	return context;
}

export function useOptionalRichTextEditorContext() {
	return useContext(RichTextEditorContext);
}

interface RichTextEditorProviderProps {
	children: ReactNode;
	editor: Editor | null;
	disabledExtensions?: string[];
	disabledGroups?: string[];
	outlineVisible?: boolean;
	onOutlineVisibleChange?: (value: boolean) => void;
}

export function RichTextEditorProvider({
	children,
	editor,
	disabledExtensions = [],
	disabledGroups = [],
	outlineVisible: initialOutlineVisible = true,
	onOutlineVisibleChange,
}: RichTextEditorProviderProps) {
	const [hasOutline, setHasOutline] = useState(false);
	const [localOutlineVisible, setLocalOutlineVisible] = useState(
		initialOutlineVisible,
	);

	useEffect(() => {
		onOutlineVisibleChange?.(localOutlineVisible);
	}, [localOutlineVisible, onOutlineVisibleChange]);

	const setOutlineVisible = useCallback(
		(value: boolean) => {
			setLocalOutlineVisible(value);
		},
		[],
	);

	const toggleOutline = useCallback(() => {
		setLocalOutlineVisible((prev) => !prev);
	}, []);

	const contextValue = useMemo(
		() => ({
			editor,
			disabledExtensions,
			disabledGroups,
			hasOutline,
			setHasOutline,
			outlineVisible: localOutlineVisible,
			setOutlineVisible,
			toggleOutline,
		}),
		[
			editor,
			disabledExtensions,
			disabledGroups,
			hasOutline,
			localOutlineVisible,
			setOutlineVisible,
			toggleOutline,
		],
	);

	return (
		<RichTextEditorContext.Provider value={contextValue}>
			{children}
		</RichTextEditorContext.Provider>
	);
}
