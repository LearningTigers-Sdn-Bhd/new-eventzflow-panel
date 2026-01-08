"use client";

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
import {
	type Editor,
	EditorContent,
	ReactRenderer,
	useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import type { SuggestionProps } from "@tiptap/suggestion";
import { useEffect, useRef } from "react";
import tippy, { type Instance } from "tippy.js";
import { uploadFile } from "@/lib/api/upload/endpoints";
import { cn } from "@/lib/utils";
import { CommandList, type CommandListRef } from "./command-list";
import { CustomBubbleMenu, LinkBubbleMenu } from "./context-menus";
import { CtaBlock } from "./extensions/cta-block";
import { Indent } from "./extensions/indent";
import {
	SlashCommands,
	type SuggestionItem,
	suggestionItems,
} from "./extensions/slash-commands";
import { Toolbar } from "./toolbar";
import "./styles.css";

interface RichEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	minHeight?: string;
	editor?: Editor | null; // Allow passing external editor
	hideToolbar?: boolean;
	editable?: boolean;
	uploadTarget?: string;
	action?: {
		label: string;
		onClick: () => void;
		disabled?: boolean;
		loading?: boolean;
	};
	children?: React.ReactNode;
}

export const useRichEditor = ({
	value,
	onChange,
	placeholder = "Write something...",
	minHeight = "200px",
	editable = true,
	uploadTarget = "general",
}: Partial<RichEditorProps>) => {
	return useEditor({
		extensions: [
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
			CtaBlock,
			Indent,
			Underline,
			TaskList,
			TaskItem.configure({
				nested: true,
			}),
			SlashCommands.configure({
				suggestion: {
					items: ({ query }: { query: string }) => {
						return suggestionItems
							.filter((item) =>
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
									(component.ref as CommandListRef | null)?.onKeyDown(props) ??
									false
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
		],
		content: value,
		editable,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class: cn(
					"max-w-none px-4 py-8 focus:outline-none md:px-12",
					"min-h-[var(--min-height)]",
				),
				style: `--min-height: ${minHeight}`,
			},
			handleClick: (view, _pos, event) => {
				const anchor = (event.target as HTMLElement).closest("a");
				if (anchor && view.editable) {
					event.preventDefault();
					event.stopPropagation();
					return true;
				}
				return false;
			},
			handleDrop: (view, event, _slice, moved) => {
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
						for (const file of imageFiles) {
							uploadFile(file, uploadTarget).then((res) => {
								const { schema } = view.state;
								const coordinates = view.posAtCoords({
									left: event.clientX,
									top: event.clientY,
								});
								const node = schema.nodes.image.create({ src: res.url });
								const transaction = view.state.tr.insert(
									coordinates?.pos ?? view.state.selection.from,
									node,
								);
								view.dispatch(transaction);
							});
						}
						return true;
					}
				}
				return false;
			},
			handlePaste: (view, event) => {
				if (event.clipboardData?.files?.[0]) {
					const files = Array.from(event.clipboardData.files);
					const imageFiles = files.filter((file) =>
						file.type.startsWith("image/"),
					);

					if (imageFiles.length > 0) {
						for (const file of imageFiles) {
							uploadFile(file, uploadTarget).then((res) => {
								const { schema } = view.state;
								const node = schema.nodes.image.create({ src: res.url });
								const transaction = view.state.tr.replaceSelectionWith(node);
								view.dispatch(transaction);
							});
						}
						return true;
					}
				}
				return false;
			},
			handleDOMEvents: {
				click: (view, event) => {
					const anchor = (event.target as HTMLElement).closest("a");

					if (anchor && view.editable) {
						event.preventDefault();
						event.stopPropagation();
						return true;
					}
					return false;
				},
			},
		},
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		},
	});
};

export const RichEditor = ({
	value,
	onChange,
	placeholder = "Write something...",
	className,
	minHeight = "200px",
	editor: propEditor,
	hideToolbar = false,
	editable = true,
	uploadTarget = "general",
	action,
	children,
}: RichEditorProps) => {
	const internalEditor = useRichEditor({
		value,
		onChange,
		placeholder,
		minHeight,
		editable,
		uploadTarget,
	});

	const editor = propEditor || internalEditor;

	// Keep track of the value we've already synced to avoid redundant updates
	// and prevent overwriting user typing when the parent re-renders.
	const lastSyncedValueRef = useRef(value);

	// Synchronize editable state
	useEffect(() => {
		if (editor && editor.isEditable !== editable) {
			editor.setEditable(editable);
		}
	}, [editor, editable]);

	// Synchronize external value changes (e.g., form resets or loading a new resource)
	useEffect(() => {
		if (!editor || value === lastSyncedValueRef.current) return;

		// Only update if the content is actually different from what the editor has
		// and the parent's value has changed since our last sync.
		if (value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false });
		}
		
		lastSyncedValueRef.current = value;
	}, [value, editor]);

	return (
		<div
			className={cn(
				"relative flex w-full flex-col overflow-hidden",
				editable && "rounded-none border border-input bg-background shadow-sm",
				className,
			)}
		>
			{!hideToolbar && (
				<Toolbar editor={editor} action={action} uploadTarget={uploadTarget} />
			)}
			<div className={cn("flex-1 overflow-auto", editable && "bg-muted/20")}>
				{editable ? (
					<div className="min-h-full w-full bg-background px-4 py-12 shadow-[0_0_1px_rgba(0,0,0,0.1)] md:px-12">
						<CustomBubbleMenu editor={editor} />
						<LinkBubbleMenu editor={editor} />
						<EditorContent editor={editor} />
						{children}
					</div>
				) : (
					<div className="w-full">
						<EditorContent editor={editor} />
						{children}
					</div>
				)}
			</div>
		</div>
	);
};