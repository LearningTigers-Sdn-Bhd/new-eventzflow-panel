"use client";

import type { Editor } from "@tiptap/react";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	ChevronDown,
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
	Quote,
	Redo,
	Save,
	Strikethrough,
	Table as TableIcon,
	Underline as UnderlineIcon,
	Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef } from "react";
import { uploadFile } from "@/lib/api/upload/endpoints";
import { cn } from "@/lib/utils";
import { LinkForm } from "./form-modals/link-form";
import { useDialog } from "@/hooks/use-dialog";

interface ToolbarProps {
	editor: Editor | null;
	action?: {
		label: string;
		onClick: () => void;
		disabled?: boolean;
		loading?: boolean;
	};
	showToC?: boolean;
	onToggleToC?: () => void;
	uploadTarget?: string;
}

export const Toolbar = ({
	editor,
	action,
	showToC,
	onToggleToC,
	uploadTarget = "general",
}: ToolbarProps) => {
	const { openDialog, closeDialog } = useDialog();
	const fileInputRef = useRef<HTMLInputElement>(null);
	if (!editor) return null;

	const ToolbarButton = ({
		onClick,
		isActive,
		children,
		tooltip,
		disabled = false,
		className = "",
	}: {
		onClick: () => void;
		isActive?: boolean;
		children: React.ReactNode;
		tooltip: string;
		disabled?: boolean;
		className?: string;
	}) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant={isActive ? "secondary" : "ghost"}
					size="sm"
					onClick={onClick}
					disabled={disabled}
					className={cn("h-8 w-8 rounded-none p-0", className)}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent
				side="bottom"
				className="rounded-none px-2 py-1 text-[10px]"
			>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	);

	const getCurrentHeading = () => {
		if (editor.isActive("heading", { level: 1 })) return "Heading 1";
		if (editor.isActive("heading", { level: 2 })) return "Heading 2";
		if (editor.isActive("heading", { level: 3 })) return "Heading 3";
		return "Paragraph";
	};

	const addImage = () => {
		const url = window.prompt("Enter image URL");
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	const setLink = () => {
		const { href, target } = editor.getAttributes("link");
		const selection = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(
			selection.from,
			selection.to,
			" ",
		);

		openDialog({
			component: LinkForm,
			props: {
				initialData: {
					url: href || "",
					label: selectedText || "",
					openInNewTab: target === "_blank",
				},
				onSubmit: (data) => {
					if (data.url === "") {
						editor.chain().focus().extendMarkRange("link").unsetLink().run();
					} else {
						// Apply link with target
						const chain = editor
							.chain()
							.focus()
							.extendMarkRange("link");

						// If label changed, replace content
						if (data.label && data.label !== selectedText) {
							chain.insertContent({
								type: "text",
								text: data.label,
								marks: [
									{
										type: "link",
										attrs: {
											href: data.url,
											target: data.openInNewTab ? "_blank" : null,
										},
									},
								],
							});
						} else {
							chain.setLink({
								href: data.url,
								target: data.openInNewTab ? "_blank" : null,
							});
						}

						chain.run();
					}
					closeDialog();
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Manage Link",
				size: "lg",
			},
		});
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			try {
				const res = await uploadFile(file, uploadTarget);
				editor.chain().focus().setImage({ src: res.url }).run();
			} catch (error) {
				console.error("Upload failed:", error);
			}
		}
		// Reset input
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const groups = [
		{
			id: "navigation",
			items: [
				{
					tooltip: "Undo",
					icon: Undo,
					onClick: () => editor.chain().focus().undo().run(),
					disabled: !editor.can().undo(),
				},
				{
					tooltip: "Redo",
					icon: Redo,
					onClick: () => editor.chain().focus().redo().run(),
					disabled: !editor.can().redo(),
				},
				...(onToggleToC
					? [
							{
								tooltip: "Table of Contents",
								icon: List,
								onClick: onToggleToC,
								isActive: showToC,
							},
						]
					: []),
			],
		},
		{
			id: "style-font",
			items: [
				{
					tooltip: "Bold",
					icon: Bold,
					onClick: () => editor.chain().focus().toggleBold().run(),
					isActive: editor.isActive("bold"),
				},
				{
					tooltip: "Italic",
					icon: Italic,
					onClick: () => editor.chain().focus().toggleItalic().run(),
					isActive: editor.isActive("italic"),
				},
				{
					tooltip: "Underline",
					icon: UnderlineIcon,
					onClick: () => editor.chain().focus().toggleUnderline().run(),
					isActive: editor.isActive("underline"),
				},
				{
					tooltip: "Strikethrough",
					icon: Strikethrough,
					onClick: () => editor.chain().focus().toggleStrike().run(),
					isActive: editor.isActive("strike"),
				},
			],
		},
		{
			id: "highlight",
			colors: [
				{ name: "Default", color: "transparent", label: "None" },
				{ name: "#ffecad", color: "#ffecad", label: "Yellow" },
				{ name: "#ffd5d2", color: "#ffd5d2", label: "Red" },
				{ name: "#d3f5d3", color: "#d3f5d3", label: "Green" },
				{ name: "#d3e5ef", color: "#d3e5ef", label: "Blue" },
				{ name: "#e9d5f0", color: "#e9d5f0", label: "Purple" },
				{ name: "#fbe4e4", color: "#fbe4e4", label: "Pink" },
				{ name: "#f1f1ef", color: "#f1f1ef", label: "Gray" },
			],
		},
		{
			id: "style-align",
			items: [
				{
					tooltip: "Align Left",
					icon: AlignLeft,
					onClick: () => editor.chain().focus().setTextAlign("left").run(),
					isActive: editor.isActive({ textAlign: "left" }),
				},
				{
					tooltip: "Align Center",
					icon: AlignCenter,
					onClick: () => editor.chain().focus().setTextAlign("center").run(),
					isActive: editor.isActive({ textAlign: "center" }),
				},
				{
					tooltip: "Align Right",
					icon: AlignRight,
					onClick: () => editor.chain().focus().setTextAlign("right").run(),
					isActive: editor.isActive({ textAlign: "right" }),
				},
				{
					tooltip: "Align Justify",
					icon: AlignJustify,
					onClick: () => editor.chain().focus().setTextAlign("justify").run(),
					isActive: editor.isActive({ textAlign: "justify" }),
				},
			],
		},
		{
			id: "style-indent",
			items: [
				{
					tooltip: "Decrease Indent",
					icon: IndentDecrease,
					onClick: () => editor.chain().focus().outdent().run(),
				},
				{
					tooltip: "Increase Indent",
					icon: IndentIncrease,
					onClick: () => editor.chain().focus().indent().run(),
				},
			],
		},
		{
			id: "list",
			items: [
				{
					tooltip: "Bullet List",
					icon: List,
					onClick: () => editor.chain().focus().toggleBulletList().run(),
					isActive: editor.isActive("bulletList"),
				},
				{
					tooltip: "Numbered List",
					icon: ListOrdered,
					onClick: () => editor.chain().focus().toggleOrderedList().run(),
					isActive: editor.isActive("orderedList"),
				},
				{
					tooltip: "Checklist",
					icon: ListTodo,
					onClick: () => editor.chain().focus().toggleTaskList().run(),
					isActive: editor.isActive("taskList"),
				},
			],
		},
		{
			id: "element",
			items: [
				{
					tooltip: "Insert CTA Block",
					icon: Megaphone,
					onClick: () =>
						editor.chain().focus().insertContent({ type: "ctaBlock" }).run(),
					isActive: editor.isActive("ctaBlock"),
				},
				{
					tooltip: "Insert Link",
					icon: LinkIcon,
					onClick: setLink,
					isActive: editor.isActive("link"),
				},
				{
					tooltip: "Upload Image",
					icon: ImageIcon,
					onClick: () => fileInputRef.current?.click(),
				},
				{
					tooltip: "Blockquote",
					icon: Quote,
					onClick: () => editor.chain().focus().toggleBlockquote().run(),
					isActive: editor.isActive("blockquote"),
				},
				{
					tooltip: "Code Block",
					icon: Code2,
					onClick: () => editor.chain().focus().toggleCodeBlock().run(),
					isActive: editor.isActive("codeBlock"),
				},
			],
		},
	];

	return (
		<TooltipProvider delayDuration={400}>
			<div className="sticky top-0 z-10 flex min-h-10 flex-wrap items-center gap-1 border-b bg-background px-1 py-2.5">
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept="image/*"
					onChange={handleFileUpload}
				/>
				{/* Navigation Group */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "navigation")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* Style Group: Heading Selector */}
				<div className="flex items-center gap-1">
					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 min-w-[110px] justify-between gap-2 rounded-none px-2"
									>
										<span className="truncate font-medium text-xs">
											{getCurrentHeading()}
										</span>
										<ChevronDown className="h-3 w-3 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								className="rounded-none px-2 py-1 text-[10px]"
							>
								Text Style
							</TooltipContent>
						</Tooltip>
						<DropdownMenuContent align="start" className="rounded-none">
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().setParagraph().run()}
							>
								Paragraph
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() =>
									editor.chain().focus().toggleHeading({ level: 1 }).run()
								}
							>
								Heading 1
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() =>
									editor.chain().focus().toggleHeading({ level: 2 }).run()
								}
							>
								Heading 2
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() =>
									editor.chain().focus().toggleHeading({ level: 3 }).run()
								}
							>
								Heading 3
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* Style Group: Align */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "style-align")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* Style Group: Font */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "style-font")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}

					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button
										variant={
											editor.isActive("highlight") ? "secondary" : "ghost"
										}
										size="sm"
										className="h-8 w-8 rounded-none p-0"
									>
										<Highlighter className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								className="rounded-none px-2 py-1 text-[10px]"
							>
								Highlight Color
							</TooltipContent>
						</Tooltip>
						<DropdownMenuContent
							align="start"
							className="grid min-w-0 grid-cols-4 gap-1 rounded-none p-2"
						>
							{groups
								.find((g) => g.id === "highlight")
								?.colors?.map((c) => (
									<DropdownMenuItem
										key={c.name}
										onClick={() => {
											if (c.color === "transparent") {
												editor.chain().focus().unsetHighlight().run();
											} else {
												editor
													.chain()
													.focus()
													.setHighlight({ color: c.color })
													.run();
											}
										}}
										className="flex h-8 w-8 items-center justify-center rounded-none border p-0 transition-transform hover:scale-110"
										style={{ backgroundColor: c.color }}
										title={c.label}
									>
										{c.color === "transparent" && (
											<div className="h-4 w-0.5 rotate-45 bg-red-500" />
										)}
									</DropdownMenuItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* Style Group: Indent */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "style-indent")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* List Group */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "list")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}
				</div>

				<Separator orientation="vertical" className="mx-1 h-6" />

				{/* Element Group */}
				<div className="flex items-center gap-0.5">
					{groups
						.find((g) => g.id === "element")
						?.items?.map((item) => (
							<ToolbarButton key={item.tooltip} {...item}>
								<item.icon className="h-4 w-4" />
							</ToolbarButton>
						))}

					{/* Table Actions */}
					<DropdownMenu>
						<Tooltip>
							<TooltipTrigger asChild>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 w-8 rounded-none p-0"
									>
										<TableIcon className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								className="rounded-none px-2 py-1 text-[10px]"
							>
								Table Actions
							</TooltipContent>
						</Tooltip>
						<DropdownMenuContent align="start" className="rounded-none">
							<DropdownMenuItem
								className="rounded-none"
								onClick={() =>
									editor
										.chain()
										.focus()
										.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
										.run()
								}
							>
								Insert Table
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().addColumnBefore().run()}
							>
								Add Column Before
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().addColumnAfter().run()}
							>
								Add Column After
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().deleteColumn().run()}
							>
								Delete Column
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().addRowBefore().run()}
							>
								Add Row Before
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().addRowAfter().run()}
							>
								Add Row After
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().deleteRow().run()}
							>
								Delete Row
							</DropdownMenuItem>
							<DropdownMenuItem
								className="rounded-none"
								onClick={() => editor.chain().focus().deleteTable().run()}
							>
								Delete Table
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{action && (
					<>
						<div className="flex-1" />
						<div className="flex items-center gap-2 pr-2">
							<Button
								size="sm"
								onClick={action.onClick}
								disabled={action.disabled || action.loading}
								className="h-8 gap-2 rounded-none px-3"
							>
								<Save className="h-4 w-4" />
								<span className="font-medium text-xs">{action.label}</span>
							</Button>
						</div>
					</>
				)}
			</div>
		</TooltipProvider>
	);
};