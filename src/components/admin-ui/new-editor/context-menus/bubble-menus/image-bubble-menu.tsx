"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { handleImageUpload } from "../../use-rich-editor";

interface ImageBubbleMenuProps {
	editor: Editor | null;
	uploadTarget?: string;
}

export const ImageBubbleMenu = ({
	editor,
	uploadTarget = "general",
}: ImageBubbleMenuProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!editor) return null;

	const handleReplace = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && editor) {
			const pos = editor.state.selection.from;
			// Delete the current image
			editor.chain().focus().deleteSelection().run();
			// Upload the new image at the same position
			handleImageUpload(editor.view, file, pos, uploadTarget);
		}
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleDelete = () => {
		editor.chain().focus().deleteSelection().run();
	};

	return (
		<BubbleMenu
			editor={editor}
			pluginKey="imageBubbleMenu"
			shouldShow={({ editor }) => editor.isActive("image")}
			options={{ placement: "bottom" }}
			className="fade-in zoom-in flex animate-in items-center gap-0.5 rounded-lg border bg-background p-1 shadow-xl duration-200"
		>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 px-2 text-xs"
				onClick={handleReplace}
			>
				<ImageIcon className="h-3.5 w-3.5" />
				Replace
			</Button>
			<Separator orientation="vertical" className="mx-1 h-4" />
			<Button
				variant="ghost"
				size="sm"
				className="h-8 w-8 p-0 text-destructive hover:text-destructive"
				onClick={handleDelete}
				title="Delete image"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</Button>
		</BubbleMenu>
	);
};
