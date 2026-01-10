"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ExternalLink, Link2Off, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialog } from "@/hooks/use-dialog";
import { LinkForm } from "../../form-modals/link-form";

interface LinkBubbleMenuProps {
	editor: Editor | null;
}

export const LinkBubbleMenu = ({ editor }: LinkBubbleMenuProps) => {
	const { openDialog, closeDialog } = useDialog();
	if (!editor) return null;

	const { href, target } = editor.getAttributes("link");

	const handleEdit = () => {
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

	const handleUnlink = () => {
		editor.chain().focus().extendMarkRange("link").unsetLink().run();
	};

	const handleOpen = () => {
		if (href) {
			window.open(href, "_blank");
		}
	};

	return (
		<BubbleMenu
			editor={editor}
			pluginKey="linkBubbleMenu"
			shouldShow={({ editor }) =>
				editor.isActive("link") && !editor.isActive("image")
			}
			options={{ placement: "bottom" }}
			className="fade-in zoom-in flex animate-in items-center gap-0.5 rounded-lg border bg-background p-1 shadow-xl duration-200"
		>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 px-2 text-xs"
				onClick={handleEdit}
			>
				<Pencil className="h-3.5 w-3.5" />
				Edit
			</Button>
			<Separator orientation="vertical" className="mx-1 h-4" />
			<Button
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={handleOpen}
				disabled={!href}
				title="Open link"
			>
				<ExternalLink className="h-3.5 w-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0"
				onClick={handleUnlink}
				title="Remove link"
			>
				<Link2Off className="h-3.5 w-3.5" />
			</Button>
		</BubbleMenu>
	);
};
