"use client";

import type { Editor } from "@tiptap/react";
import { Hash, ListTree } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface EditorContentOutlineProps {
	editor: Editor | null;
	style?: "block" | "inset";
	side?: "left" | "right";
	className?: string;
	onItemClick?: () => void;
}

interface Heading {
	text: string;
	level: number;
	pos: number;
}

function areHeadingsEqual(a: Heading[], b: Heading[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (
			a[i].text !== b[i].text ||
			a[i].level !== b[i].level ||
			a[i].pos !== b[i].pos
		) {
			return false;
		}
	}
	return true;
}

function debounce<T extends (...args: unknown[]) => void>(
	fn: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), wait);
	};
}

export function EditorContentOutline({
	editor,
	style = "block",
	side = "left",
	className,
	onItemClick,
}: EditorContentOutlineProps) {
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

		setHeadings((prev) => {
			if (areHeadingsEqual(prev, items)) return prev;
			return items;
		});
	}, [editor]);

	const updateActiveHeading = useCallback(() => {
		if (!editor) return;

		const { from } = editor.state.selection;
		let currentHeadingPos = -1;

		// Iterate backwards to find the nearest heading before or at the cursor
		for (let i = headings.length - 1; i >= 0; i--) {
			if (headings[i].pos <= from) {
				currentHeadingPos = headings[i].pos;
				break;
			}
		}

		setActivePos(currentHeadingPos);
	}, [editor, headings]);

	const debouncedUpdateHeadings = useMemo(
		() => debounce(updateHeadings, 300),
		[updateHeadings],
	);

	useEffect(() => {
		if (!editor) return;

		editor.on("update", debouncedUpdateHeadings);
		editor.on("selectionUpdate", updateActiveHeading);

		// Initial check
		updateHeadings();
		updateActiveHeading();

		return () => {
			editor.off("update", debouncedUpdateHeadings);
			editor.off("selectionUpdate", updateActiveHeading);
		};
	}, [
		editor,
		debouncedUpdateHeadings,
		updateActiveHeading,
		updateHeadings, // Included to satisfy linter, though updateHeadings is stable/memoized usually
	]);

	const scrollToHeading = (pos: number) => {
		if (!editor) return;

		editor.chain().setTextSelection(pos).focus().run();

		requestAnimationFrame(() => {
			const dom = editor.view.nodeDOM(pos);
			const element =
				dom instanceof HTMLElement
					? dom
					: (editor.view.domAtPos(pos).node as HTMLElement);

			if (element) {
				element.scrollIntoView({
					block: "start",
				});
			}
		});

		if (onItemClick) onItemClick();
	};

	const containerClass = cn(
		"flex h-full flex-col overflow-hidden transition-all duration-200",
		style === "inset" && "border-x shadow-sm",
		side === "right" && "border-l-0",
		side === "left" && "border-r-0",
		className,
	);

	if (!editor) {
		return (
			<div className={containerClass}>
				<div className="flex shrink-0 items-center gap-2 px-4 py-4">
					<ListTree className="size-4" />
					<span className="font-semibold text-sm">Table of Contents</span>
				</div>
				<div className="flex flex-1 items-center justify-center px-4 py-2 text-muted-foreground">
					<p className="text-xs">No editor</p>
				</div>
			</div>
		);
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
				{headings.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<ListTree className="size-4 opacity-20" />
						<p className="text-xs">No headings yet</p>
					</div>
				) : (
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
				)}
			</div>
		</div>
	);
}
