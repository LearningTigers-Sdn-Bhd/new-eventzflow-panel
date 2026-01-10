"use client";

import type { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import { Heading1, Heading2, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomFloatingMenuProps {
	editor: Editor | null;
}

export const CustomFloatingMenu = ({ editor }: CustomFloatingMenuProps) => {
	if (!editor) return null;

	return (
		<FloatingMenu
			editor={editor}
			pluginKey="customFloatingMenu"
			className="fade-in slide-in-from-left-2 flex animate-in items-center gap-0.5 rounded-lg border bg-background p-1 shadow-lg duration-200"
		>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<Heading1 className="h-4 w-4" />
				<span className="text-xs">H1</span>
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Heading2 className="h-4 w-4" />
				<span className="text-xs">H2</span>
			</Button>
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-2 px-2 text-muted-foreground hover:text-foreground"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
			>
				<List className="h-4 w-4" />
				<span className="text-xs">List</span>
			</Button>
		</FloatingMenu>
	);
};
