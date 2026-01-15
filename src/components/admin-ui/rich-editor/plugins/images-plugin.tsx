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

// Maximum file size for rich editor images (10MB - matches backend)
const MAX_RICH_EDITOR_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed image types for rich editor
const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
];

/**
 * Validates and uploads an image for the rich text editor
 * @param file The file to upload
 * @returns Promise resolving to the uploaded image URL
 */
async function uploadImage(file: File): Promise<string> {
	// Validate file type
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		throw new Error(
			`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
		);
	}

	// Validate file size
	if (file.size > MAX_RICH_EDITOR_FILE_SIZE) {
		const maxSizeMB = MAX_RICH_EDITOR_FILE_SIZE / (1024 * 1024);
		throw new Error(
			`File size exceeds maximum allowed size of ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
		);
	}

	try {
		const response = await uploadFile(file, "rich-editor");
		return response.url;
	} catch (error) {
		console.error("Image upload failed:", error);
		// Re-throw with a user-friendly message if it's an API error
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Failed to upload image. Please try again.");
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

							// Trigger upload with better error handling
							uploadImage(file)
								.then((remoteUrl) => {
									// Clean up blob URL to free memory
									URL.revokeObjectURL(blobUrl);

									editor.update(() => {
										const node = imageNode.getLatest();
										if ($isImageNode(node)) {
											node.setSrc(remoteUrl);
										}
									});
									toast.success("Image uploaded successfully");
								})
								.catch((error) => {
									// Clean up blob URL on error
									URL.revokeObjectURL(blobUrl);

									const errorMessage =
										error instanceof Error
											? error.message
											: "Image upload failed. Please try again.";

									toast.error(errorMessage, {
										duration: 5000,
									});

									editor.update(() => {
										const node = imageNode.getLatest();
										if ($isImageNode(node)) {
											node.remove();
										}
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
				(event) => {
					return onPaste(event, editor);
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

function onPaste(event: ClipboardEvent, editor: LexicalEditor): boolean {
	const clipboardData = event.clipboardData;
	if (!clipboardData) {
		return false;
	}

	const items = Array.from(clipboardData.items);
	const imageItem = items.find((item) => item.type.startsWith("image/"));

	if (!imageItem) {
		return false;
	}

	// Get the file from the clipboard item
	const file = imageItem.getAsFile();
	if (!file) {
		return false;
	}

	// Prevent default paste behavior
	event.preventDefault();

	// Dispatch the INSERT_IMAGE_COMMAND with the File object
	// This will trigger the upload flow in the INSERT_IMAGE_COMMAND handler
	editor.dispatchCommand(INSERT_IMAGE_COMMAND, file);

	return true;
}
