"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export interface TocItem {
	id: string;
	text: string;
	level: number;
	position: number;
}

export interface RichEditorContextValue {
	editor: LexicalEditor | null;
	hasOutline: boolean;
	setHasOutline: (value: boolean) => void;
	outlineVisible: boolean;
	setOutlineVisible: (value: boolean) => void;
	toggleOutline: () => void;
	toc: TocItem[];
	setToc: Dispatch<SetStateAction<TocItem[]>>;
	disabledExtensions?: string[];
	disabledGroups?: string[];
	scrollContainer: HTMLDivElement | null;
	setScrollContainer: Dispatch<SetStateAction<HTMLDivElement | null>>;
}

const RichEditorContext = createContext<RichEditorContextValue | null>(null);

export function useRichEditorContext() {
	const context = useContext(RichEditorContext);
	if (!context) {
		throw new Error("useRichEditorContext must be used within a RichEditor");
	}
	return context;
}

interface RichEditorProviderProps {
	children: ReactNode;
	outlineVisible?: boolean;
	onOutlineVisibleChange?: (value: boolean) => void;
	disabledExtensions?: string[];
	disabledGroups?: string[];
}

export function RichEditorProvider({
	children,
	outlineVisible: initialOutlineVisible = true,
	onOutlineVisibleChange,
	disabledExtensions = [],
	disabledGroups = [],
}: RichEditorProviderProps) {
	// Hook must be called unconditionally.
	// This component must be used inside a LexicalComposer.
	const [editor] = useLexicalComposerContext();

	const [hasOutline, setHasOutline] = useState(false);
	const [localOutlineVisible, setLocalOutlineVisible] = useState(
		initialOutlineVisible,
	);
	const [toc, setToc] = useState<TocItem[]>([]);
	const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
		null,
	);

	useEffect(() => {
		onOutlineVisibleChange?.(localOutlineVisible);
	}, [localOutlineVisible, onOutlineVisibleChange]);

	const setOutlineVisible = useCallback((value: boolean) => {
		setLocalOutlineVisible(value);
	}, []);

	const toggleOutline = useCallback(() => {
		setLocalOutlineVisible((prev) => !prev);
	}, []);

	const contextValue = useMemo(
		() => ({
			editor,
			hasOutline,
			setHasOutline,
			outlineVisible: localOutlineVisible,
			setOutlineVisible,
			toggleOutline,
			toc,
			setToc,
			disabledExtensions,
			disabledGroups,
			scrollContainer,
			setScrollContainer,
		}),
		[
			editor,
			hasOutline,
			localOutlineVisible,
			setOutlineVisible,
			toggleOutline,
			toc,
			disabledExtensions,
			disabledGroups,
			scrollContainer,
		],
	);

	return (
		<RichEditorContext.Provider value={contextValue}>
			{children}
		</RichEditorContext.Provider>
	);
}
