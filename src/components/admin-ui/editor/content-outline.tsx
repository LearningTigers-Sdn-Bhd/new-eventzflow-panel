"use client";

import type { Editor } from "@tiptap/react";
import { Hash, ListTree } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface ContentOutlineProps {
	editor: Editor | null;
	onItemClick?: () => void;
}

interface Heading {
	text: string;
	level: number;
	pos: number;
}

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(
	fn: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), wait);
	};
}

export const ContentOutline = ({
	editor,
	onItemClick,
}: ContentOutlineProps) => {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activePos, setActivePos] = useState<number | null>(null);

	const updateHeadings = useCallback(() => {
		if (!editor) return;

		const items: Heading[] = [];
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "heading") {
				items.push({
					text: node.textContent,
					level: node.attrs.level,
					pos: pos,
				});
			}
		});
		setHeadings(items);
	}, [editor]);

	const updateActiveHeading = useCallback(() => {
		if (!editor) return;

		const { from } = editor.state.selection;
		let currentHeadingPos = -1;

		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "heading" && pos <= from) {
				currentHeadingPos = pos;
			}
		});

		setActivePos(currentHeadingPos);
	}, [editor]);

	// Debounce updates to avoid document traversal on every keystroke
	const debouncedUpdateHeadings = useMemo(
		() => debounce(updateHeadings, 300),
		[updateHeadings],
	);

	const debouncedUpdateActiveHeading = useMemo(
		() => debounce(updateActiveHeading, 100),
		[updateActiveHeading],
	);

	useEffect(() => {
		if (!editor) return;

		editor.on("update", debouncedUpdateHeadings);
		editor.on("selectionUpdate", debouncedUpdateActiveHeading);

		updateHeadings();
		updateActiveHeading();

		return () => {
			editor.off("update", debouncedUpdateHeadings);
			editor.off("selectionUpdate", debouncedUpdateActiveHeading);
		};
	}, [
		editor,
		updateHeadings,
		updateActiveHeading,
		debouncedUpdateHeadings,
		debouncedUpdateActiveHeading,
	]);

	if (!editor || headings.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center px-4 py-2 text-muted-foreground">
				<ListTree className="size-4 opacity-20" />
				<p className="text-xs">No headings yet</p>
			</div>
		);
	}

	const scrollToHeading = (pos: number) => {
		if (!editor) return;

		// 1. Set the selection and focus the editor
		editor.chain().setTextSelection(pos).focus().run();

		// 2. Instant scroll to the heading
		// We use requestAnimationFrame to ensure this happens immediately after
		// TipTap's internal focus behavior, overriding it with a precise jump.
		requestAnimationFrame(() => {
			const dom = editor.view.nodeDOM(pos);
			const element =
				dom instanceof HTMLElement
					? dom
					: (editor.view.domAtPos(pos).node as HTMLElement);

			if (element) {
				// No behavior: "smooth" means an instant, accurate jump
				// that perfectly respects scroll-margin-top: 5rem
				element.scrollIntoView({
					block: "start",
				});
			}
		});

		if (onItemClick) onItemClick();
	};

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="flex shrink-0 items-center gap-2 border-b px-4 py-4">
				<ListTree className="size-4" />
				<span className="font-semibold text-sm">Table of Contents</span>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				<nav className="space-y-1 pb-10">
					{headings.map((heading, index) => (
						<button
							key={`${heading.pos}-${index}`}
							type="button"
							onClick={() => scrollToHeading(heading.pos)}
							className={cn(
								"group flex w-full items-start gap-2 border-transparent border-l-2 px-2 py-1.5 text-left text-xs transition-all hover:bg-muted",
								heading.level === 1 ? "font-bold" : "text-muted-foreground",
								heading.level === 2 && "pl-4",
								heading.level === 3 && "pl-6",
								activePos === heading.pos &&
									"border-primary bg-muted text-primary",
							)}
						>
							<Hash
								className={cn(
									"mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50",
									activePos === heading.pos && "text-primary opacity-100",
								)}
							/>
							<span className="truncate">{heading.text || "Untitled"}</span>
						</button>
					))}
				</nav>
			</div>
		</div>
	);
};
