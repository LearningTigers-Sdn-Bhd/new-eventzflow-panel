"use client";

import { createContext, useContext } from "react";

export interface TocItem {
	id: string;
	text: string;
	level: number;
}

interface RichDisplayContextType {
	html: string;
	toc: TocItem[];
	activeId: string | null;
	outlineVisible: boolean;
	setOutlineVisible: (visible: boolean) => void;
	scrollContainer: HTMLElement | null;
	setScrollContainer: (element: HTMLElement | null) => void;
	style: "block" | "inset";
}

export const RichDisplayContext = createContext<RichDisplayContextType | null>(
	null,
);

export function useRichDisplayContext() {
	const context = useContext(RichDisplayContext);
	if (!context) {
		throw new Error("useRichDisplayContext must be used within RichDisplay");
	}
	return context;
}
