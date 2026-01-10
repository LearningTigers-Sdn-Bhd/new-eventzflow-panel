"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import type { LexicalCommand, LexicalEditor } from "lexical";
import {
	$createParagraphNode,
	$getSelection,
	$insertNodes,
	$isNodeSelection,
	$isRootOrShadowRoot,
	COMMAND_PRIORITY_EDITOR,
	COMMAND_PRIORITY_HIGH,
	COMMAND_PRIORITY_LOW,
	createCommand,
	DRAGOVER_COMMAND,
	DRAGSTART_COMMAND,
	DROP_COMMAND,
	PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";
import { toast } from "sonner";
import type { ImagePayload } from "../nodes/image-node";
import { $createImageNode, $isImageNode, ImageNode } from "../nodes/image-node";

export type InsertImagePayload = Readonly<ImagePayload> | File;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
	createCommand("INSERT_IMAGE_COMMAND");

import { uploadFile } from "@/lib/api/upload/endpoints";

async function uploadImage(file: File): Promise<string> {
	try {
		const response = await uploadFile(file, "rich-editor");
		return response.url;
	} catch (error) {
		console.error("Image upload failed:", error);
		throw error;
	}
}

export default function ImagesPlugin(): null {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (!editor.hasNodes([ImageNode])) {
			throw new Error("ImagesPlugin: ImageNode not registered on editor");
		}

		return mergeRegister(
			editor.registerCommand<InsertImagePayload>(
				INSERT_IMAGE_COMMAND,
				(payload) => {
					if (payload instanceof File) {
						const file = payload;
						const blobUrl = URL.createObjectURL(file);

						// Optimistic UI: Insert immediately with blob URL
						// We need to insert it and then update it later?
						// Or just insert it.
						// If we want to replace src later, we need the node key.

																		editor.update(() => {
																				const imageNode = $createImageNode({
																						altText: file.name,
																						src: blobUrl,
																				});
																				$insertNodes([imageNode]);
																				if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
																						$wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
																				}
						
																				// Trigger upload
																				uploadImage(file)
																						.then((remoteUrl) => {
																								editor.update(() => {
																										const node = imageNode.getLatest();
																										if ($isImageNode(node)) {
																												node.setSrc(remoteUrl);
																										}
																								});
																								toast.success("Image uploaded");
																						})
																						.catch(() => {
																								toast.error("Image upload failed");
																								editor.update(() => {
																										const node = imageNode.getLatest();
																										node.remove();
																								});
																						});
																		});
						return true;
					}

					const imageNode = $createImageNode(payload);
					$insertNodes([imageNode]);
					if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
						$wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
					}

					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
			editor.registerCommand<DragEvent>(
				DRAGSTART_COMMAND,
				(event) => {
					return onDragStart(event);
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand<DragEvent>(
				DRAGOVER_COMMAND,
				(event) => {
					return onDragOver(event);
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand<DragEvent>(
				DROP_COMMAND,
				(event) => {
					return onDrop(event, editor);
				},
				COMMAND_PRIORITY_HIGH,
			),
			editor.registerCommand<ClipboardEvent>(
				PASTE_COMMAND,
				() => {
					// Handle paste
					// ...
					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [editor]);

	return null;
}

const TRANSPARENT_IMAGE =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function onDragStart(event: DragEvent): boolean {
	const node = getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const dataTransfer = event.dataTransfer;
	if (!dataTransfer) {
		return false;
	}
	dataTransfer.setData("text/plain", "_");

	// Create img element only on client side when dragging starts
	if (typeof document !== "undefined") {
		const img = document.createElement("img");
		img.src = TRANSPARENT_IMAGE;
		dataTransfer.setDragImage(img, 0, 0);
	}

	dataTransfer.setData(
		"application/x-lexical-drag",
		JSON.stringify({
			data: {
				altText: node.__altText,
				caption: node.__caption,
				height: node.__height,
				key: node.getKey(),
				maxWidth: node.__maxWidth,
				showCaption: node.__showCaption,
				src: node.__src,
				width: node.__width,
			},
			type: "image",
		}),
	);

	return true;
}

function onDragOver(event: DragEvent): boolean {
	const node = getImageNodeInSelection();
	if (!node) {
		return false;
	}
	if (!canDropImage(event)) {
		event.preventDefault();
	}
	return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
	const node = getImageNodeInSelection();
	if (!node) {
		return false;
	}
	const data = event.dataTransfer?.getData("application/x-lexical-drag");
	if (!data) {
		return false;
	}
	const { type, data: imageData } = JSON.parse(data);
	if (type !== "image") {
		return false;
	}
	event.preventDefault();
	editor.dispatchCommand(INSERT_IMAGE_COMMAND, imageData);
	return true;
}

function getImageNodeInSelection(): ImageNode | null {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return null;
	}
	const nodes = selection.getNodes();
	const node = nodes[0];
	return $isImageNode(node) ? node : null;
}

function canDropImage(event: DragEvent): boolean {
	const target = event.target;
	return !!(
		target &&
		target instanceof HTMLElement &&
		!target.closest("code, span.editor-image") &&
		target.parentElement &&
		target.parentElement.closest("div.ContentEditable__root")
	);
}
