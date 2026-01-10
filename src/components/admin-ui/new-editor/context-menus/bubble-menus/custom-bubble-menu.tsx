"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
	Bold,
	Heading1,
	Heading2,
	Highlighter,
	Italic,
	Link as LinkIcon,
	Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import { LinkForm } from "../../form-modals/link-form";

interface CustomBubbleMenuProps {
	editor: Editor | null;
}

export const CustomBubbleMenu = ({ editor }: CustomBubbleMenuProps) => {
	const { openDialog, closeDialog } = useDialog();
	if (!editor) return null;

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
						const chain = editor.chain().focus().extendMarkRange("link");

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

	return (
		<BubbleMenu
			editor={editor}
			pluginKey="customBubbleMenu"
			shouldShow={({ state, editor }) => {
				return !state.selection.empty && !editor.isActive("image");
			}}
			options={{ placement: "top" }}
			className="fade-in zoom-in flex animate-in items-center gap-0.5 rounded-lg border bg-background p-1 shadow-xl duration-200"
		>
			<Button
				variant={editor.isActive("bold") ? "secondary" : "ghost"}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => editor.chain().focus().toggleBold().run()}
			>
				<Bold className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("italic") ? "secondary" : "ghost"}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => editor.chain().focus().toggleItalic().run()}
			>
				<Italic className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("underline") ? "secondary" : "ghost"}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
			>
				<UnderlineIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("link") ? "secondary" : "ghost"}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={setLink}
			>
				<LinkIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive("highlight") ? "secondary" : "ghost"}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() =>
					editor.chain().focus().toggleHighlight({ color: "#ffecad" }).run()
				}
			>
				<Highlighter className="h-4 w-4" />
			</Button>
			<Separator orientation="vertical" className="mx-1 h-4" />
			<Button
				variant={
					editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
				}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<Heading1 className="h-4 w-4" />
			</Button>
			<Button
				variant={
					editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
				}
				size="sm"
				className="h-8 w-8 p-0"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Heading2 className="h-4 w-4" />
			</Button>
		</BubbleMenu>
	);
};
