"use client";

import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRichEditorContext } from "./context";
import { FloatingImageToolbarPlugin } from "./plugins/floating-image-toolbar-plugin";
import { FloatingLinkEditorPlugin } from "./plugins/floating-link-editor-plugin";
import { FloatingTextMenuPlugin } from "./plugins/floating-text-menu-plugin";
import ImagesPlugin from "./plugins/images-plugin";
import SlashCommandPlugin from "./plugins/slash-command-plugin";
import { TableOfContentsPlugin } from "./plugins/table-of-contents-plugin";

interface RichEditorContentAreaProps {
	className?: string;
	children?: ReactNode;
	placeholder?: string;
	minHeight?: string;
}

export function RichEditorContentArea({
	className,
	children,
	placeholder = "Start writing...",
	minHeight = "200px",
}: RichEditorContentAreaProps) {
	const { setScrollContainer } = useRichEditorContext();

	return (
		<div
			className="flex-1 scroll-pt-20 overflow-auto bg-muted/20"
			ref={setScrollContainer}
		>
			<div
				className={cn(
					"min-h-full w-full bg-background px-4 py-12 shadow-[0_0_1px_rgba(0,0,0,0.1)] md:px-12",
					className,
				)}
			>
				{children}

				{children && (
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

				                <div className="relative">
				                    <RichTextPlugin
				                        contentEditable={
				                            <ContentEditable
				                                className={cn(
				                                    "ContentEditable__root prose prose-sm dark:prose-invert min-h-[150px] max-w-none resize-none outline-none",
				                                    `min-h-[${minHeight}]`,
				                                )}
				                                style={{ minHeight }}
				                            />
				                        }
				                        placeholder={
				                            <div className="editor-placeholder">
				                                {placeholder}
				                            </div>
				                        }
				                        ErrorBoundary={LexicalErrorBoundary}
				                    />					<HistoryPlugin />
					<AutoFocusPlugin />
					<ListPlugin />
					<CheckListPlugin />
					<LinkPlugin />
					<ImagesPlugin />
					<TablePlugin />
					<TableOfContentsPlugin />
					<TabIndentationPlugin />
					<MarkdownShortcutPlugin transformers={TRANSFORMERS} />
					<SlashCommandPlugin />
					<FloatingTextMenuPlugin />
					<FloatingLinkEditorPlugin />
					<FloatingImageToolbarPlugin />
				</div>
			</div>
		</div>
	);
}
