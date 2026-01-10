"use client";

import type { AnyExtension } from "@tiptap/core";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { ReactRenderer, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { SuggestionProps } from "@tiptap/suggestion";
import type { Node, Slice } from "prosemirror-model";
import type { EditorProps, EditorView } from "prosemirror-view";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import tippy, { type Instance } from "tippy.js";
import { uploadFile } from "@/lib/api/upload/endpoints";
import { cn } from "@/lib/utils";
import { CommandList, type CommandListRef } from "./command-list";
import { CtaBlock } from "./extensions/cta-block";
import { Indent } from "./extensions/indent";
import {
	SlashCommands,
	type SuggestionItem,
	suggestionItems,
} from "./extensions/slash-commands";

interface UseRichEditorOptions {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minHeight?: string;
	uploadTarget?: string;
	disabledExtensions?: string[];
	disabledGroups?: string[];
}

export const useRichEditor = ({
	value,
	onChange,
	placeholder = "Write something...",
	minHeight = "200px",
	uploadTarget = "general",
	disabledExtensions = [],
	disabledGroups = [],
}: Partial<UseRichEditorOptions>) => {
	// Stabilize array references based on content
	const lastExtensionsRef = useRef(disabledExtensions);
	if (disabledExtensions?.join(",") !== lastExtensionsRef.current?.join(",")) {
		lastExtensionsRef.current = disabledExtensions;
	}
	const stableDisabledExtensions = lastExtensionsRef.current;

	const lastGroupsRef = useRef(disabledGroups);
	if (disabledGroups?.join(",") !== lastGroupsRef.current?.join(",")) {
		lastGroupsRef.current = disabledGroups;
	}
	const stableDisabledGroups = lastGroupsRef.current;

	const extensions = useMemo(() => {
		const isExtensionDisabled = (extensionName: string) =>
			stableDisabledExtensions?.includes(extensionName);
		const isGroupDisabled = (groupName: string) =>
			stableDisabledGroups?.includes(groupName);

		const exts = [
			Highlight.configure({
				multicolor: true,
			}),
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Link.configure({
				openOnClick: false,
				autolink: true,
				linkOnPaste: true,
				HTMLAttributes: {
					class: "text-sky-500 underline underline-offset-4 cursor-pointer",
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: "rounded-lg border shadow-sm max-w-full h-auto my-4",
				},
			}),
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			Underline,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
		] as unknown as AnyExtension[];

		if (!isExtensionDisabled("cta-block") && !isGroupDisabled("element")) {
			exts.push(CtaBlock);
		}

		if (!isExtensionDisabled("indent") && !isGroupDisabled("style-indent")) {
			exts.push(Indent);
		}

		if (!isGroupDisabled("slash-commands")) {
			exts.push(
				SlashCommands.configure({
					suggestion: {
						items: ({ query }: { query: string }) => {
							return suggestionItems
								.filter((item: SuggestionItem) =>
									item.title.toLowerCase().startsWith(query.toLowerCase()),
								)
								.slice(0, 10);
						},
						render: () => {
							let component: ReactRenderer;
							let popup: Instance[];

							return {
								onStart: (props: SuggestionProps<SuggestionItem>) => {
									component = new ReactRenderer(CommandList, {
										props,
										editor: props.editor,
									});

									if (!props.clientRect) {
										return;
									}

									popup = tippy("body", {
										getReferenceClientRect: props.clientRect as () => DOMRect,
										appendTo: () => document.body,
										content: component.element,
										showOnCreate: true,
										interactive: true,
										trigger: "manual",
										placement: "bottom-start",
									}) as Instance[];
								},

								onUpdate(props: SuggestionProps<SuggestionItem>) {
									component.updateProps(props);

									if (!props.clientRect) {
										return;
									}

									popup[0].setProps({
										getReferenceClientRect: props.clientRect as () => DOMRect,
									});
								},

								onKeyDown(props: { event: KeyboardEvent }) {
									if (props.event.key === "Escape") {
										popup[0].hide();
										return true;
									}

									return (
										(component.ref as CommandListRef | null)?.onKeyDown(
											props,
										) ?? false
									);
								},

								onExit() {
									popup[0].destroy();
									component.destroy();
								},
							};
						},
					},
				}),
			);
		}
		return exts;
	}, [placeholder, stableDisabledExtensions, stableDisabledGroups]);

	const editorProps: EditorProps = useMemo(
		() => ({
			attributes: {
				class: cn(
					"max-w-none px-4 py-8 focus:outline-none md:px-12",
					"min-h-[var(--min-height)]",
				),
				style: `--min-height: ${minHeight}`,
			},
			scrollMargin: { bottom: 80, top: 80, left: 0, right: 0 },
			handleClick: (view: EditorView, _pos: number, event: MouseEvent) => {
				const target = event.target as HTMLElement;
				const anchor = target.closest("a");
				if (anchor && view.editable) {
					event.preventDefault();
					event.stopPropagation();
					return true;
				}
				return false;
			},
			handleDrop: (
				view: EditorView,
				event: DragEvent,
				_slice: Slice,
				moved: boolean,
			) => {
				if (
					!moved &&
					event.dataTransfer &&
					event.dataTransfer.files &&
					event.dataTransfer.files[0]
				) {
					const files = Array.from(event.dataTransfer.files);
					const imageFiles = files.filter((file) =>
						file.type.startsWith("image/"),
					);

					if (imageFiles.length > 0) {
						const coordinates = view.posAtCoords({
							left: event.clientX,
							top: event.clientY,
						});
						const pos = coordinates?.pos ?? view.state.selection.from;

						for (const file of imageFiles) {
							handleImageUpload(view, file, pos, uploadTarget);
						}
						return true;
					}
				}
				return false;
			},
			handlePaste: (view: EditorView, event: ClipboardEvent) => {
				if (event.clipboardData?.files?.[0]) {
					const files = Array.from(event.clipboardData.files);
					const imageFiles = files.filter((file) =>
						file.type.startsWith("image/"),
					);

					if (imageFiles.length > 0) {
						const pos = view.state.selection.from;
						for (const file of imageFiles) {
							handleImageUpload(view, file, pos, uploadTarget);
						}
						return true;
					}
				}
				return false;
			},
			handleDOMEvents: {
				click: (view: EditorView, event: MouseEvent) => {
					const target = event.target as HTMLElement;
					const anchor = target.closest("a");

					if (anchor && view.editable) {
						event.preventDefault();
						event.stopPropagation();
						return true;
					}
					return false;
				},
			},
		}),
		[minHeight, uploadTarget],
	);

	return useEditor(
		{
			extensions,
			content: value,
			editable: true,
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
			editorProps,
			onUpdate: ({ editor }) => {
				queueMicrotask(() => {
					onChange?.(editor.getHTML());
				});
			},
		},
		[extensions, editorProps],
	);
};

/**
 * Optimistic image upload handler
 */
export async function handleImageUpload(
	view: EditorView,
	file: File,
	pos: number,
	uploadTarget: string,
) {
	const { schema } = view.state;
	const blobUrl = URL.createObjectURL(file);

	// 1. Insert optimistic image
	const node = schema.nodes.image.create({
		src: blobUrl,
		alt: file.name,
	});
	const transaction = view.state.tr.insert(pos, node);
	view.dispatch(transaction);

	try {
		// 2. Perform actual upload
		const res = await uploadFile(file, uploadTarget);

		// 3. Find the node with the blob URL and replace it with the remote URL
		const currentDoc = view.state.doc;
		let foundPos = -1;

		currentDoc.descendants((node: Node, pos: number) => {
			if (node.type.name === "image" && node.attrs.src === blobUrl) {
				foundPos = pos;
				return false; // stop iteration
			}
		});

		if (foundPos !== -1) {
			const updateTransaction = view.state.tr.setNodeMarkup(
				foundPos,
				undefined,
				{
					...schema.nodes.image.create({ src: res.url, alt: file.name }).attrs,
				},
			);
			view.dispatch(updateTransaction);
		}
	} catch (error) {
		console.error("Upload failed:", error);
		toast.error(`Failed to upload ${file.name}`);

		// 4. Remove the optimistic image if upload fails
		const currentDoc = view.state.doc;
		let foundPos = -1;
		let nodeSize = 0;

		currentDoc.descendants((node: Node, pos: number) => {
			if (node.type.name === "image" && node.attrs.src === blobUrl) {
				foundPos = pos;
				nodeSize = node.nodeSize;
				return false;
			}
		});

		if (foundPos !== -1) {
			const deleteTransaction = view.state.tr.delete(
				foundPos,
				foundPos + nodeSize,
			);
			view.dispatch(deleteTransaction);
		}
	} finally {
		URL.revokeObjectURL(blobUrl);
	}
}
