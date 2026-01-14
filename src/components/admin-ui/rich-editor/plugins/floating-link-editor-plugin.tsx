"use client";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { BaseSelection, LexicalEditor } from "lexical";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDOMRangeRect } from "./floating-text-menu-plugin"; // Reuse utility
import { getSelectedNode } from "./utils"; // Need to implement this utility

function FloatingLinkEditor({ editor }: { editor: LexicalEditor }) {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [linkUrl, setLinkUrl] = useState("");
	const [target, setTarget] = useState<"_blank" | undefined>(undefined);
	const [isEditMode, setIsEditMode] = useState(false);
	const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
		null,
	);

	const updateLinkEditor = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent)) {
				setLinkUrl(parent.getURL());
				setTarget(parent.getTarget() as "_blank" | undefined);
			} else if ($isLinkNode(node)) {
				setLinkUrl(node.getURL());
				setTarget(node.getTarget() as "_blank" | undefined);
			} else {
				setLinkUrl("");
				setTarget(undefined);
			}
		}
		// ...
		const editorElem = editorRef.current;
		const nativeSelection = window.getSelection();
		const rootElement = editor.getRootElement();

		if (
			editorElem === null ||
			nativeSelection === null ||
			rootElement === null ||
			!rootElement.contains(nativeSelection.anchorNode)
		) {
			return;
		}

		const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

		if (rangeRect) {
			editorElem.style.opacity = "1";
			editorElem.style.position = "absolute";

			const top = rangeRect.top + rangeRect.height + 8; // Below the text
			const left = rangeRect.left; // Align left

			editorElem.style.top = `${top + window.scrollY}px`;
			editorElem.style.left = `${left + window.scrollX}px`;
		}
	}, [editor]);

	useEffect(() => {
		const update = () => {
			editor.getEditorState().read(() => {
				updateLinkEditor();
			});
		};
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update);

		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update);
		};
	}, [editor, updateLinkEditor]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			updateLinkEditor();
		});
	}, [editor, updateLinkEditor]);

	useEffect(() => {
		if (isEditMode && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditMode]);

	const monitorInputInteraction = (
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleLinkSubmission();
		} else if (event.key === "Escape") {
			event.preventDefault();
			setIsEditMode(false);
		}
	};

	const handleLinkSubmission = () => {
		if (lastSelection !== null) {
			if (linkUrl !== "") {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: linkUrl, target });
			}
			setIsEditMode(false);
		}
	};

	return (
		<div
			ref={editorRef}
			className="fade-in zoom-in absolute top-0 left-0 z-50 flex w-auto min-w-[300px] animate-in flex-col rounded-none border bg-background p-2 shadow-xl duration-200"
		>
			{isEditMode ? (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Input
							ref={inputRef}
							className="h-8 rounded-none"
							value={linkUrl}
							onChange={(event) => setLinkUrl(event.target.value)}
							onKeyDown={monitorInputInteraction}
							placeholder="https://..."
						/>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-none p-0"
							onClick={handleLinkSubmission}
						>
							<Check className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-none p-0"
							onClick={() => setIsEditMode(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					<div className="flex items-center gap-2 px-1">
						<input
							type="checkbox"
							id="link-target-blank"
							checked={target === "_blank"}
							onChange={(e) =>
								setTarget(e.target.checked ? "_blank" : undefined)
							}
							className="h-3 w-3 rounded-none border-gray-300"
						/>
						<label
							htmlFor="link-target-blank"
							className="cursor-pointer select-none text-muted-foreground text-xs"
						>
							Open in New Tab
						</label>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-between gap-2">
					<a
						href={linkUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="mr-2 max-w-[200px] truncate text-blue-500 text-sm hover:underline"
					>
						{linkUrl}
					</a>
					<div className="flex items-center gap-1">
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-none p-0"
							onClick={() => {
								setLinkUrl(linkUrl);
								editor.getEditorState().read(() => {
									setLastSelection($getSelection());
								});
								setIsEditMode(true);
							}}
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-none p-0"
							onClick={() => {
								editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-none p-0"
							onClick={() => window.open(linkUrl, "_blank")}
						>
							<ExternalLink className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function useFloatingLinkEditorToolbar(editor: LexicalEditor) {
	const [isLink, setIsLink] = useState(false);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = getSelectedNode(selection);
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}
		} else {
			setIsLink(false);
		}
	}, []);

	useEffect(() => {
		return editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			(_payload, _newEditor) => {
				updateToolbar();
				return false;
			},
			COMMAND_PRIORITY_LOW,
		);
	}, [editor, updateToolbar]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				updateToolbar();
			});
		});
	}, [editor, updateToolbar]);

	return { isLink };
}

export function FloatingLinkEditorPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}) {
	const [editor] = useLexicalComposerContext();
	const { isLink } = useFloatingLinkEditorToolbar(editor);

	if (!isLink) {
		return null;
	}

	return createPortal(<FloatingLinkEditor editor={editor} />, anchorElem);
}
