"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useOptionalRichTextEditorContext } from "./context";
import {
	CustomBubbleMenu,
	ImageBubbleMenu,
	LinkBubbleMenu,
} from "./context-menus/bubble-menus";
import { CustomFloatingMenu } from "./context-menus/floating-menus";
import "./styles.css";

interface EditorContentAreaProps {
	editor: Editor | null;
	className?: string;
	uploadTarget?: string;
	children?: ReactNode;
}

export function EditorContentArea({
	editor,
	className,
	uploadTarget,
	children,
}: EditorContentAreaProps) {
	const context = useOptionalRichTextEditorContext();
	const editMode = context?.editMode ?? false;

	return (
		<div className={cn("flex-1 overflow-auto", editMode && "bg-muted/20")}>
			<div
				className={
					editMode
						? cn(
								"min-h-full w-full bg-background px-4 py-12 shadow-[0_0_1px_rgba(0,0,0,0.1)] md:px-12",
								className,
							)
						: cn("w-full", className)
				}
			>
				{editMode && editor && (
					<>
						<CustomBubbleMenu editor={editor} />
						<LinkBubbleMenu editor={editor} />
						<ImageBubbleMenu editor={editor} uploadTarget={uploadTarget} />
						<CustomFloatingMenu editor={editor} />
					</>
				)}
				{children}
				{editMode && (
					<div className="relative py-8">
						<div
							className="absolute inset-0 flex items-center"
							aria-hidden="true"
						>
							<div className="w-full border-t border-dashed" />
						</div>
						<div className="relative flex justify-start">
							<span className="bg-background pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
								Editable Content
							</span>
						</div>
					</div>
				)}
				{editor && <TiptapEditorContent editor={editor} />}
			</div>
		</div>
	);
}
