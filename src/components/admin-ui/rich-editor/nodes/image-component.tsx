"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import type { NodeKey } from "lexical";
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
} from "lexical";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { $isImageNode } from "./image-node";

export default function ImageComponent({
	src,
	altText,
	nodeKey,
}: {
	src: string;
	altText: string;
	nodeKey: NodeKey;
}) {
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [editor] = useLexicalComposerContext();
	const imageRef = useRef<HTMLImageElement>(null);

	const onDelete = useCallback(
		(payload: KeyboardEvent) => {
			if (isSelected && $isNodeSelection($getSelection())) {
				const event: KeyboardEvent = payload;
				event.preventDefault();
				const node = $getNodeByKey(nodeKey);
				if ($isImageNode(node)) {
					node.remove();
				}
			}
			return false;
		},
		[isSelected, nodeKey],
	);

	const onClick = useCallback(
		(payload: MouseEvent) => {
			const event = payload;

			if (event.target === imageRef.current) {
				if (event.shiftKey) {
					setSelected(!isSelected);
				} else {
					clearSelection();
					setSelected(true);
				}
				return true;
			}

			return false;
		},
		[isSelected, setSelected, clearSelection],
	);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand<MouseEvent>(
				CLICK_COMMAND,
				onClick,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor, onDelete, onClick]);

	return (
		<div
			className={cn(
				"relative my-4 w-full overflow-hidden",
				isSelected && "ring-2 ring-primary",
			)}
		>
			<Image
				ref={imageRef}
				src={src}
				alt={altText}
				width={1200}
				height={800}
				unoptimized
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
				className="h-auto w-full object-cover"
				draggable="false"
			/>
		</div>
	);
}