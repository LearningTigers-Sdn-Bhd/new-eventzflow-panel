"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import { memo, type ReactNode, useEffect, useState } from "react";
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

const PureEditorContent = memo(
	({ editor }: { editor: Editor | null }) => {
		const [isReady, setIsReady] = useState(false);

		useEffect(() => {
			if (editor) {
				const id = requestAnimationFrame(() => setIsReady(true));
				return () => cancelAnimationFrame(id);
			}
			setIsReady(false);
		}, [editor]);

		if (!editor || !isReady) return null;
		return <TiptapEditorContent editor={editor} />;
	},
	(prev, next) => prev.editor === next.editor,
);

export function EditorContentArea({
	editor,
	className,
	uploadTarget,
	children,
}: EditorContentAreaProps) {
	return (
		<div className={cn("flex-1 overflow-auto bg-muted/20")}>
			<div
				className={cn(
					"min-h-full w-full bg-background px-4 py-12 shadow-[0_0_1px_rgba(0,0,0,0.1)] md:px-12",
					className,
				)}
			>
				{editor && (
					<>
						<CustomBubbleMenu editor={editor} />
						<LinkBubbleMenu editor={editor} />
						<ImageBubbleMenu editor={editor} uploadTarget={uploadTarget} />
						<CustomFloatingMenu editor={editor} />
					</>
				)}
				{children}
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
				<PureEditorContent editor={editor} />
			</div>
		</div>
	);
}
