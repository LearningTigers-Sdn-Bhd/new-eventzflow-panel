"use client";

import { $createCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
	INSERT_CHECK_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
	$isMarkNode,
	$unwrapMarkNode,
	$wrapSelectionInMarkNode,
} from "@lexical/mark";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
	$deleteTableColumnAtSelection,
	$deleteTableRowAtSelection,
	$findTableNode,
	$insertTableColumnAtSelection,
	$insertTableRowAtSelection,
	INSERT_TABLE_COMMAND,
} from "@lexical/table";
import { mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$insertNodes,
	$isRangeSelection,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	COMMAND_PRIORITY_CRITICAL,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	INDENT_CONTENT_COMMAND,
	OUTDENT_CONTENT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
} from "lexical";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	Code2,
	Highlighter,
	Image as ImageIcon,
	IndentDecrease,
	IndentIncrease,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	ListTodo,
	Megaphone,
	MoreHorizontal,
	Quote,
	Redo,
	Strikethrough,
	Table as TableIcon,
	Underline,
	Undo,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRichEditorContext } from "../context";
import { $createCtaNode } from "../nodes/cta-node";
import { ToolbarButton } from "../toolbar-button";
import { INSERT_IMAGE_COMMAND } from "./images-plugin";

type ToolbarItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
	isActive?: boolean;
	disabled?: boolean;
	type?: "button" | "dropdown";
	items?: ToolbarItem[]; // For dropdowns
};

type ToolbarGroup = {
	id: string;
	items: ToolbarItem[];
};

export function ToolbarPlugin({
	children: _children,
}: {
	children?: React.ReactNode;
}) {
	const [editor] = useLexicalComposerContext();
	const { hasOutline, outlineVisible, toggleOutline, disabledGroups } =
		useRichEditorContext();

	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [isHighlight, setIsHighlight] = useState(false);

	const [visibleGroupCount, setVisibleGroupCount] = useState(100);
	const measureRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isOutlineDisabled = disabledGroups?.includes("outline");

	const updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat("bold"));
			setIsItalic(selection.hasFormat("italic"));
			setIsUnderline(selection.hasFormat("underline"));
			setIsStrikethrough(selection.hasFormat("strikethrough"));
			setIsCode(selection.hasFormat("code"));

			// Check for links
			const node = selection.getNodes()[0];
			const parent = node.getParent();
			setIsLink(parent?.getType() === "link" || node.getType() === "link");

			// Check for highlight
			let hasMark = false;
			const nodes = selection.getNodes();
			for (const node of nodes) {
				if ($isMarkNode(node) || $isMarkNode(node.getParent())) {
					hasMark = true;
					break;
				}
			}
			setIsHighlight(hasMark);
		}
	}, []);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateToolbar();
				});
			}),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
		);
	}, [editor, updateToolbar]);

	// Measurement Logic for Collapsing
	useEffect(() => {
		const container = measureRef.current;
		if (!container) return;

		let timeoutId: NodeJS.Timeout;
		let frameId: number;

		const performMeasurement = () => {
			if (frameId) cancelAnimationFrame(frameId);
			frameId = requestAnimationFrame(() => {
				const children = Array.from(container.children) as HTMLElement[];
				let count = 0;
				if (children.length > 0) {
					const top = children[0].offsetTop;
					for (let i = 0; i < children.length; i++) {
						if (children[i].offsetTop > top + 5) {
							break;
						}
						count++;
					}
				}
				setVisibleGroupCount(count);
			});
		};

		const debouncedCheckLayout = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(performMeasurement, 100);
		};

		// Re-measure when layout dependencies change
		performMeasurement();

		const observer = new ResizeObserver(debouncedCheckLayout);
		observer.observe(container);

		return () => {
			observer.disconnect();
			clearTimeout(timeoutId);
			if (frameId) cancelAnimationFrame(frameId);
		};
	}, []);

	const insertCta = () => {
		editor.update(() => {
			const ctaNode = $createCtaNode({});
			$insertNodes([ctaNode]);
		});
	};

	const toggleHighlight = () => {
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
					$wrapSelectionInMarkNode(
						selection,
						selection.isBackward(),
						"highlight",
					);
				}
			}
		});
	};

	// Maximum file size for rich editor images (10MB - matches backend)
	const MAX_RICH_EDITOR_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];

			// Client-side validation for better UX
			if (file.size > MAX_RICH_EDITOR_FILE_SIZE) {
				const maxSizeMB = MAX_RICH_EDITOR_FILE_SIZE / (1024 * 1024);
				const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
				toast.error(
					`File size (${currentSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
					{ duration: 5000 },
				);
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
				return;
			}

			editor.dispatchCommand(INSERT_IMAGE_COMMAND, file);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const groups: ToolbarGroup[] = [
		{
			id: "navigation",
			items: [
				{
					id: "undo",
					label: "Undo",
					icon: Undo,
					onClick: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
					disabled: !canUndo,
				},
				{
					id: "redo",
					label: "Redo",
					icon: Redo,
					onClick: () => editor.dispatchCommand(REDO_COMMAND, undefined),
					disabled: !canRedo,
				},
				...(hasOutline && !isOutlineDisabled
					? [
							{
								id: "toc",
								label: "Table of Contents",
								icon: List,
								onClick: toggleOutline,
								isActive: outlineVisible,
							},
						]
					: []),
			],
		},
		{
			id: "style-font",
			items: [
				{
					id: "bold",
					label: "Format Bold",
					icon: Bold,
					onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
					isActive: isBold,
				},
				{
					id: "italic",
					label: "Format Italic",
					icon: Italic,
					onClick: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
					isActive: isItalic,
				},
				{
					id: "underline",
					label: "Format Underline",
					icon: Underline,
					onClick: () =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline"),
					isActive: isUnderline,
				},
				{
					id: "strikethrough",
					label: "Format Strikethrough",
					icon: Strikethrough,
					onClick: () =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough"),
					isActive: isStrikethrough,
				},
				{
					id: "highlight",
					label: "Highlight",
					icon: Highlighter,
					onClick: toggleHighlight,
					isActive: isHighlight,
				},
			],
		},
		{
			id: "style-align",
			items: [
				{
					id: "align-left",
					label: "Align Left",
					icon: AlignLeft,
					onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
				},
				{
					id: "align-center",
					label: "Align Center",
					icon: AlignCenter,
					onClick: () =>
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
				},
				{
					id: "align-right",
					label: "Align Right",
					icon: AlignRight,
					onClick: () =>
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
				},
				{
					id: "align-justify",
					label: "Align Justify",
					icon: AlignJustify,
					onClick: () =>
						editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
				},
			],
		},
		{
			id: "style-indent",
			items: [
				{
					id: "outdent",
					label: "Decrease Indent",
					icon: IndentDecrease,
					onClick: () =>
						editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined),
				},
				{
					id: "indent",
					label: "Increase Indent",
					icon: IndentIncrease,
					onClick: () =>
						editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined),
				},
			],
		},
		{
			id: "list",
			items: [
				{
					id: "bullet-list",
					label: "Bullet List",
					icon: List,
					onClick: () =>
						editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
				},
				{
					id: "ordered-list",
					label: "Numbered List",
					icon: ListOrdered,
					onClick: () =>
						editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
				},
				{
					id: "checklist",
					label: "Checklist",
					icon: ListTodo,
					onClick: () =>
						editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
				},
			],
		},
		{
			id: "element",
			items: [
				{
					id: "cta",
					label: "Insert CTA Block",
					icon: Megaphone,
					onClick: insertCta,
				},
				{
					id: "link",
					label: "Insert Link",
					icon: LinkIcon,
					onClick: () =>
						editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://"),
					isActive: isLink,
				},
				{
					id: "image",
					label: "Upload Image",
					icon: ImageIcon,
					onClick: () => fileInputRef.current?.click(),
				},
				{
					id: "quote",
					label: "Blockquote",
					icon: Quote,
					onClick: () => {
						editor.update(() => {
							const selection = $getSelection();
							if ($isRangeSelection(selection)) {
								$setBlocksType(selection, () => $createQuoteNode());
							}
						});
					},
				},
				{
					id: "code",
					label: "Code Block",
					icon: Code2,
					onClick: () => {
						editor.update(() => {
							const selection = $getSelection();
							if ($isRangeSelection(selection)) {
								$setBlocksType(selection, () => $createCodeNode());
							}
						});
					},
					isActive: isCode,
				},
				{
					id: "table",
					label: "Table",
					icon: TableIcon,
					type: "dropdown",
					items: [
						{
							id: "insert-table",
							label: "Insert Table",
							icon: TableIcon,
							onClick: () =>
								editor.dispatchCommand(INSERT_TABLE_COMMAND, {
									columns: "3",
									rows: "3",
									includeHeaders: true,
								}),
						},
						{
							id: "col-before",
							label: "Add Column Before",
							icon: TableIcon, // Placeholder icon
							onClick: () =>
								editor.update(() => $insertTableColumnAtSelection(false)),
						},
						{
							id: "col-after",
							label: "Add Column After",
							icon: TableIcon,
							onClick: () =>
								editor.update(() => $insertTableColumnAtSelection(true)),
						},
						{
							id: "del-col",
							label: "Delete Column",
							icon: TableIcon,
							onClick: () =>
								editor.update(() => $deleteTableColumnAtSelection()),
						},
						{
							id: "row-before",
							label: "Add Row Before",
							icon: TableIcon,
							onClick: () =>
								editor.update(() => $insertTableRowAtSelection(false)),
						},
						{
							id: "row-after",
							label: "Add Row After",
							icon: TableIcon,
							onClick: () =>
								editor.update(() => $insertTableRowAtSelection(true)),
						},
						{
							id: "del-row",
							label: "Delete Row",
							icon: TableIcon,
							onClick: () => editor.update(() => $deleteTableRowAtSelection()),
						},
						{
							id: "del-table",
							label: "Delete Table",
							icon: TableIcon,
							onClick: () =>
								editor.update(() => {
									const selection = $getSelection();
									if ($isRangeSelection(selection)) {
										const tableNode = $findTableNode(
											selection.anchor.getNode(),
										);
										if (tableNode) {
											tableNode.remove();
										}
									}
								}),
						},
					],
				},
			],
		},
	];

	const renderGroup = (group: ToolbarGroup) => (
		<div className="flex items-center gap-1">
			{group.items.map((item) => {
				if (item.type === "dropdown") {
					return (
						<DropdownMenu key={item.id}>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									aria-label={item.label}
									className="h-8 w-8 rounded-none p-0"
								>
									<item.icon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="rounded-none">
								{item.items?.map((subItem) => (
									<DropdownMenuItem
										key={subItem.id}
										onClick={subItem.onClick}
										className="rounded-none"
									>
										{subItem.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				}
				if (!item.onClick) {
					return null;
				}
				return (
					<ToolbarButton
						key={item.id}
						onClick={item.onClick}
						isActive={item.isActive}
						disabled={item.disabled}
						tooltip={item.label}
					>
						<item.icon className="h-4 w-4" />
					</ToolbarButton>
				);
			})}
		</div>
	);

	const renderOverflowGroup = (group: ToolbarGroup) => (
		<>
			{group.items.map((item) => {
				if (item.type === "dropdown") {
					return (
						<DropdownMenuSub key={item.id}>
							<DropdownMenuSubTrigger className="flex items-center gap-2 rounded-none">
								<item.icon className="h-4 w-4" />
								<span>{item.label}</span>
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="rounded-none">
								{item.items?.map((subItem) => (
									<DropdownMenuItem
										key={subItem.id}
										onClick={subItem.onClick}
										className="rounded-none"
									>
										{subItem.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					);
				}
				return (
					<DropdownMenuItem
						key={item.id}
						onClick={item.onClick}
						disabled={item.disabled}
						className="flex items-center gap-2 rounded-none"
					>
						<item.icon className="h-4 w-4" />
						<span>{item.label}</span>
						{item.isActive && (
							<div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
						)}
					</DropdownMenuItem>
				);
			})}
		</>
	);

	const visibleGroups = groups.slice(0, visibleGroupCount);
	const overflowGroups = groups.slice(visibleGroupCount);

	return (
		<TooltipProvider delayDuration={400}>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleImageUpload}
			/>

			<div className="flex flex-1 items-center gap-1 overflow-hidden">
				{/* Hidden Measurement Container */}
				<div
					ref={measureRef}
					className="pointer-events-none absolute top-0 left-0 -z-50 flex w-full flex-wrap items-center gap-1 opacity-0"
					aria-hidden="true"
				>
					{groups.map((group) => (
						<div key={group.id} className="flex items-center">
							{group.id !== "navigation" && (
								<Separator orientation="vertical" className="mx-1 h-6" />
							)}
							{renderGroup(group)}
						</div>
					))}
				</div>

				{/* Visible Toolbar */}
				<div className="flex h-9 min-w-0 flex-1 items-center gap-1 overflow-hidden">
					{visibleGroups.map((group, index) => (
						<div key={group.id} className="flex items-center">
							{group.id !== "navigation" &&
								(index > 0 || visibleGroups[0].id !== "navigation") && (
									<Separator orientation="vertical" className="mx-1 h-6" />
								)}
							{renderGroup(group)}
						</div>
					))}
				</div>

				{/* Overflow Dropdown */}
				{overflowGroups.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-6 rounded-none p-0 text-muted-foreground hover:text-foreground"
								title="More tools"
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56 rounded-none p-2"
							sideOffset={5}
						>
							<div className="flex flex-col gap-1">
								{overflowGroups.map((group, index) => (
									<div key={group.id} className="flex flex-col">
										{index > 0 && <DropdownMenuSeparator className="my-1" />}
										{renderOverflowGroup(group)}
									</div>
								))}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</TooltipProvider>
	);
}
