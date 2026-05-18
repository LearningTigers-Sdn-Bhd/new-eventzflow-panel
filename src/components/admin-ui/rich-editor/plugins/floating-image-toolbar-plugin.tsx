"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import {
	$getSelection,
	$isNodeSelection,
	COMMAND_PRIORITY_LOW,
	SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { $isImageNode } from "../nodes/image-node";
import { INSERT_IMAGE_COMMAND } from "./images-plugin";

function FloatingImageToolbar({ editor }: { editor: LexicalEditor }) {
	const popupRef = useRef<HTMLDivElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			const popupElem = popupRef.current;
			const rootElement = editor.getRootElement();

			if (popupElem === null || rootElement === null) {
				return;
			}

			const nativeSelection = window.getSelection();
			if (nativeSelection === null) {
				return;
			}

			if (!$isNodeSelection(selection) || selection.getNodes().length === 0) {
				return;
			}

			const node = selection.getNodes()[0];
			if (!$isImageNode(node)) {
				return;
			}

			const element = editor.getElementByKey(node.getKey());
			if (element === null) {
				return;
			}

			const rect = element.getBoundingClientRect();

			popupElem.style.opacity = "1";
			popupElem.style.position = "absolute";

			// Center bottom
			const top = rect.top + rect.height + 8;
			const left = rect.left + rect.width / 2 - popupElem.offsetWidth / 2;

			popupElem.style.top = `${top + window.scrollY}px`;
			popupElem.style.left = `${left + window.scrollX}px`;
		});
	}, [editor]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			updatePopup();
		});
	}, [editor, updatePopup]);

	useEffect(() => {
		window.addEventListener("resize", updatePopup);
		window.addEventListener("scroll", updatePopup);

		return () => {
			window.removeEventListener("resize", updatePopup);
			window.removeEventListener("scroll", updatePopup);
		};
	}, [updatePopup]);

	const handleDelete = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isNodeSelection(selection)) {
				const node = selection.getNodes()[0];
				if ($isImageNode(node)) {
					node.remove();
				}
			}
		});
	};

	const handleReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			// The selection is already on the image, so inserting should replace it
			editor.dispatchCommand(INSERT_IMAGE_COMMAND, file);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div
			ref={popupRef}
			className="fade-in zoom-in absolute top-0 left-0 z-50 flex animate-in items-center gap-0.5 rounded-none border bg-background p-1 shadow-xl duration-200"
			style={{ opacity: 0, transition: "opacity 0.2s" }}
		>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleReplace}
			/>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 rounded-none px-2 text-xs"
				onClick={() => fileInputRef.current?.click()}
			>
				<ImageIcon className="h-3.5 w-3.5" />
				Replace
			</Button>
			<Separator orientation="vertical" className="mx-1 h-4" />
			<Button
				variant="ghost"
				size="sm"
				className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
				onClick={handleDelete}
				title="Delete image"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
}

export function FloatingImageToolbarPlugin({
	anchorElem = document.body,
}: {
	anchorElem?: HTMLElement;
}) {
	const [editor] = useLexicalComposerContext();
	const [isImage, setIsImage] = useState(false);

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isNodeSelection(selection)) {
			const node = selection.getNodes()[0];
			setIsImage($isImageNode(node));
		} else {
			setIsImage(false);
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

	if (!isImage) {
		return null;
	}

	return createPortal(<FloatingImageToolbar editor={editor} />, anchorElem);
}
