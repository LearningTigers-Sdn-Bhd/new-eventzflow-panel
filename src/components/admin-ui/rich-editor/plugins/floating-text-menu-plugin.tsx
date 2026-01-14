"use client";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isMarkNode, $unwrapMarkNode, $wrapSelectionInMarkNode } from "@lexical/mark";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import {
	Bold,
	Code,
	Highlighter,
	Italic,
	Link,
	Strikethrough,
	Underline,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { getSelectedNode } from "./utils";

function FloatingMenuToolbar({
	editor,
	isBold,
	isItalic,
	isUnderline,
	isStrikethrough,
	isCode,
	isLink,
	isHighlight,
}: {
	editor: LexicalEditor;
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	isStrikethrough: boolean;
	isCode: boolean;
	isLink: boolean;
	isHighlight: boolean;
}) {
	const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null);

	const insertLink = useCallback(() => {
		if (!isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	const toggleHighlight = useCallback(() => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				if (isHighlight) {
					const nodes = selection.getNodes();
					for (const node of nodes) {
						if ($isMarkNode(node)) {
							$unwrapMarkNode(node);
						} else {
							const parent = node.getParent();
							if ($isMarkNode(parent)) {
								$unwrapMarkNode(parent);
							}
						}
					}
				} else {
					$wrapSelectionInMarkNode(selection, selection.isBackward(), "highlight");
				}
			}
		});
	}, [editor, isHighlight]);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
			const nativeSelection = window.getSelection();

			if (popupCharStylesEditorElem === null) {
				return;
			}

			const rootElement = editor.getRootElement();
			if (
				selection !== null &&
				nativeSelection !== null &&
				!nativeSelection.isCollapsed &&
				rootElement !== null &&
				rootElement.contains(nativeSelection.anchorNode)
			) {
				const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

				if (rangeRect) {
					popupCharStylesEditorElem.style.opacity = "1";
					popupCharStylesEditorElem.style.position = "absolute";

					const top = rangeRect.top - popupCharStylesEditorElem.offsetHeight - 8;
					const left =
						rangeRect.left +
						rangeRect.width / 2 -
						popupCharStylesEditorElem.offsetWidth / 2;

					popupCharStylesEditorElem.style.top = `${top + window.scrollY}px`;
					popupCharStylesEditorElem.style.left = `${left + window.scrollX}px`;
				}
			}
		});
	}, [editor]);

	useEffect(() => {
		window.addEventListener("resize", updatePopup);
		window.addEventListener("scroll", updatePopup);

		return () => {
			window.removeEventListener("resize", updatePopup);
			window.removeEventListener("scroll", updatePopup);
		};
	}, [updatePopup]);

	useEffect(() => {
		updatePopup();
	}, [updatePopup]);

	return (
		<div
			ref={popupCharStylesEditorRef}
			className="fade-in zoom-in absolute top-0 left-0 z-50 flex items-center gap-0.5 rounded-none border bg-background p-1 shadow-xl duration-200"
			style={{ opacity: 0, transition: "opacity 0.2s" }}
		>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isBold && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Format Bold"
			>
				<Bold className="h-4 w-4" />
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isItalic && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Format Italic"
			>
				<Italic className="h-4 w-4" />
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isUnderline && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Format Underline"
			>
				<Underline className="h-4 w-4" />
			</button>
			<button
				onClick={() =>
					editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
				}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isStrikethrough && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Format Strikethrough"
			>
				<Strikethrough className="h-4 w-4" />
			</button>
			<button
				onClick={toggleHighlight}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isHighlight && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Highlight"
			>
				<Highlighter className="h-4 w-4" />
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isCode && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Format Code"
			>
				<Code className="h-4 w-4" />
			</button>
			<button
				onClick={insertLink}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-muted",
					isLink && "bg-muted text-foreground",
				)}
				type="button"
				aria-label="Insert Link"
			>
				<Link className="h-4 w-4" />
			</button>
		</div>
	);
}

function useFloatingTextMenu(editor: LexicalEditor) {
	const [isText, setIsText] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [isHighlight, setIsHighlight] = useState(false);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			if (editor.isComposing()) {
				return;
			}
			const selection = $getSelection();
			const nativeSelection = window.getSelection();
			const rootElement = editor.getRootElement();

			if (
				nativeSelection !== null &&
				(!$isRangeSelection(selection) ||
					rootElement === null ||
					!rootElement.contains(nativeSelection.anchorNode))
			) {
				setIsText(false);
				return;
			}

			if (!$isRangeSelection(selection)) {
				return;
			}

			const rawTextContent = selection.getTextContent().replace(/\n/g, "");
			if (!selection.isCollapsed() && rawTextContent.length === 0) {
				setIsText(false);
				return;
			}

			if (selection.isCollapsed()) {
				setIsText(false);
				return;
			}

			setIsText(true);
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsStrikethrough(selection.hasFormat("strikethrough"));
			setIsCode(selection.hasFormat("code"));

			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}
			
			// Check for Highlight (MarkNode)
			// Simple check: see if we are inside a MarkNode
			let hasMark = false;
			const nodes = selection.getNodes();
			for (const node of nodes) {
				if ($isMarkNode(node) || $isMarkNode(node.getParent())) {
					hasMark = true;
					break;
				}
			}
			// Better check: $isMarkNode(parent) or common ancestor?
			// But for now, simple check if parent is MarkNode
			if ($isMarkNode(parent)) {
				hasMark = true;
			}
			setIsHighlight(hasMark);
		});
	}, [editor]);

	useEffect(() => {
		document.addEventListener("selectionchange", updatePopup);
		return () => {
			document.removeEventListener("selectionchange", updatePopup);
		};
	}, [updatePopup]);

	useEffect(() => {
		return editor.registerUpdateListener(() => {
			updatePopup();
		});
	}, [editor, updatePopup]);

	return {
		isText,
		isBold,
		isItalic,
		isUnderline,
		isStrikethrough,
		isCode,
		isLink,
		isHighlight,
	};
}

export function FloatingTextMenuPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}) {
	const [editor] = useLexicalComposerContext();
	const {
		isText,
		isBold,
		isItalic,
		isUnderline,
		isStrikethrough,
		isCode,
		isLink,
		isHighlight,
	} = useFloatingTextMenu(editor);

	if (!isText) {
		return null;
	}

	return createPortal(
		<FloatingMenuToolbar
			editor={editor}
			isBold={isBold}
			isItalic={isItalic}
			isUnderline={isUnderline}
			isStrikethrough={isStrikethrough}
			isCode={isCode}
			isLink={isLink}
			isHighlight={isHighlight}
		/>,
		anchorElem,
	);
}

// Helper to get bounding rect of the selection
export function getDOMRangeRect(
	nativeSelection: Selection,
	rootElement: HTMLElement,
): DOMRect {
	const domRange = nativeSelection.getRangeAt(0);
	let rect: DOMRect;

	if (nativeSelection.anchorNode === rootElement) {
		let inner = rootElement;
		while (inner.firstElementChild != null) {
			inner = inner.firstElementChild as HTMLElement;
		}
		rect = inner.getBoundingClientRect();
	} else {
		rect = domRange.getBoundingClientRect();
	}

	return rect;
}
