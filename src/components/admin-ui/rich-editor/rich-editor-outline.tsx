"use client";

import {
	$createRangeSelection,
	$getNodeByKey,
	$getSelection,
	$isRangeSelection,
	$setSelection,
} from "lexical";
import { Hash, ListTree } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRichEditorContext as useRichEditor } from "./context";

interface RichEditorOutlineProps {
	side?: "left" | "right";
	style?: "block" | "inset";
	className?: string;
	children?: ReactNode;
}

export function RichEditorOutline({
	side = "left",
	style = "block",
	className,
	children,
}: RichEditorOutlineProps) {
	const { toc, editor } = useRichEditor();
	const [activeId, setActiveId] = useState<string | null>(null);

	const containerClass = cn(
		"flex h-full flex-col overflow-hidden transition-all duration-200",
		style === "inset" && "border-x shadow-sm",
		side === "right" && "border-l-0",
		side === "left" && "border-r-0",
		className,
	);

	const scrollToNode = (key: string) => {
		if (!editor) return;

		editor.update(() => {
			const headingNode = $getNodeByKey(key);
			if (headingNode) {
				const rangeSelection = $createRangeSelection();
				rangeSelection.anchor.set(key, 0, "element");
				rangeSelection.focus.set(key, 0, "element");
				$setSelection(rangeSelection);
			}
		});

		requestAnimationFrame(() => {
			const element = editor?.getElementByKey(key);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		});
	};

	// Pure Cursor Detection approach:
	// Listen to selection changes via editor update listener.

	useEffect(() => {
		if (!editor || toc.length === 0) return;

		// Cursor Detection Logic
		const removeUpdateListener = editor.registerUpdateListener(
			({ editorState }) => {
				editorState.read(() => {
					// Only update if we have a selection
					const selection = $getSelection();
					if (!$isRangeSelection(selection)) return;

					const anchorNode = selection.anchor.getNode();

					// Optimization: we want the heading that belongs to this section.
					// We can iterate backwards through TOC.
					// The first TOC item that is 'before' or 'contains' the anchor node is our active section.

					// We need node keys.
					// Lexical nodes don't have a simple "index" we can compare easily without traversal,
					// but we can check $isBefore.

					// However, comparing every TOC item with $isBefore is O(N).
					// Since N (headings) is small, this is fine.

					let foundId: string | null = null;

					// 1. Containment Check: Are we inside a heading?
					const tocIds = new Set(toc.map((t) => t.id));
					let curr = anchorNode;
					while (curr) {
						if (tocIds.has(curr.getKey())) {
							foundId = curr.getKey();
							break;
						}
						const parent = curr.getParent();
						if (!parent) break;
						curr = parent;
					}

					// 2. Precedence Check: Find the last heading before the anchor
					if (!foundId) {
						for (let i = toc.length - 1; i >= 0; i--) {
							const tocItem = toc[i];
							const headingNode = $getNodeByKey(tocItem.id);

							if (headingNode?.isBefore(anchorNode)) {
								foundId = tocItem.id;
								break;
							}
						}
					}

					if (foundId) {
						setActiveId(foundId);
					}
				});
			},
		);

		return () => {
			removeUpdateListener();
		};
	}, [toc, editor]);

	if (children) {
		return <div className={containerClass}>{children}</div>;
	}

	return (
		<div className={containerClass}>
			<div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
				<div className="flex items-center gap-2">
					<ListTree className="size-4" />
					<span className="font-semibold text-sm">Table of Contents</span>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				{toc.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<ListTree className="size-4 opacity-20" />
						<p className="text-xs">No headings yet</p>
					</div>
				) : (
					<nav className="space-y-1 pb-10">
						{toc.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => scrollToNode(item.id)}
								className={cn(
									"group flex w-full items-start gap-2 border-transparent border-l-2 px-2 py-1.5 text-left text-xs transition-all hover:bg-muted",
									item.level === 1 ? "font-bold" : "text-muted-foreground",
									item.level === 2 && "pl-4",
									item.level === 3 && "pl-6",
									activeId === item.id &&
										"border-primary bg-muted text-primary",
								)}
							>
								<Hash
									className={cn(
										"mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50",
										activeId === item.id && "text-primary opacity-100",
									)}
								/>
								<span className="truncate">{item.text}</span>
							</button>
						))}
					</nav>
				)}
			</div>
		</div>
	);
}
