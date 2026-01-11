"use client";

import { PanelLeft } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	RichDisplayContext,
	type TocItem,
	useRichDisplayContext,
} from "./context";
import { RichDisplayContent } from "./display-content";
import { RichDisplayOutline } from "./display-outline";

interface RichDisplayProps {
	content: string; // HTML string
	className?: string;
	children?: ReactNode;
}

interface CollectedChildren {
	outline: ReactNode;
	contentArea: ReactNode;
	outlineConfig: { style: "block" | "inset"; side: "left" | "right" } | null;
}

function collectChildren(children: ReactNode): CollectedChildren {
	const childrenArray = children
		? Array.isArray(children)
			? children
			: [children]
		: [];

	let outline: ReactNode = null;
	let contentArea: ReactNode = null;
	let outlineConfig: CollectedChildren["outlineConfig"] = null;

	for (const child of childrenArray) {
		if (!child || typeof child === "string" || typeof child === "number")
			continue;

		const childElement = child as React.ReactElement;
		const childType = childElement.type;
		const childProps = childElement.props;

		// Check for RichDisplayOutline component
		if (childType === RichDisplayOutline) {
			outline = child;
			outlineConfig = {
				style: (childProps as { style?: "block" | "inset" }).style || "block",
				side: (childProps as { side?: "left" | "right" }).side || "left",
			};
			continue;
		}

		// Check for RichDisplayContent component
		if (childType === RichDisplayContent) {
			contentArea = child;
		}
	}

	return { outline, contentArea, outlineConfig };
}

function RichDisplayLayout({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const { outlineVisible, setOutlineVisible, style } = useRichDisplayContext();
	const collected = useMemo(() => collectChildren(children), [children]);
	const { outlineConfig } = collected;

	useEffect(() => {
		setOutlineVisible(!!collected.outline);
	}, [collected.outline, setOutlineVisible]);

	const isBlockStyle = style === "block";
	const isLeftSide = outlineConfig?.side === "left";
	const isOutlineVisible = !!collected.outline && outlineVisible;

	const renderDesktopContent = () => {
		if (isBlockStyle) {
			const gridCols = isOutlineVisible
				? isLeftSide
					? "grid-cols-[240px_1fr]"
					: "grid-cols-[1fr_240px]"
				: "grid-cols-1";

			return (
				<div className={cn("grid w-full items-start gap-4", gridCols)}>
					{isLeftSide && isOutlineVisible && (
						<div className="sticky top-0 h-screen overflow-y-auto">
							{collected.outline}
						</div>
					)}

					<div className="relative flex min-w-0 flex-col">
						{collected.outline && (
							<div className="sticky top-0 left-0 z-50 h-0 w-fit overflow-visible">
								<Button
									variant="outline"
									size="icon"
									className="mt-6 ml-6 rounded-full bg-background/80 opacity-50 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100"
									onClick={() => setOutlineVisible(!outlineVisible)}
								>
									<PanelLeft className="h-4 w-4" />
								</Button>
							</div>
						)}
						{collected.contentArea}
					</div>

					{!isLeftSide && isOutlineVisible && (
						<div className="sticky top-0 h-screen overflow-y-auto">
							{collected.outline}
						</div>
					)}
				</div>
			);
		}

		// Inset style
		const gridCols = isOutlineVisible
			? isLeftSide
				? "grid-cols-[240px_1fr]"
				: "grid-cols-[1fr_240px]"
			: "grid-cols-1";

		return (
			<div className={cn("grid w-full items-start", gridCols)}>
				{isLeftSide && isOutlineVisible && (
					<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-r">
						{collected.outline}
					</div>
				)}

				<div className="relative min-w-0 flex-1">
					{collected.outline && (
						<div className="sticky top-0 left-0 z-50 h-0 w-fit overflow-visible">
							<Button
								variant="outline"
								size="icon"
								className="mt-6 ml-6 rounded-full bg-background/80 opacity-50 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100"
								onClick={() => setOutlineVisible(!outlineVisible)}
							>
								<PanelLeft className="h-4 w-4" />
							</Button>
						</div>
					)}
					{collected.contentArea}
				</div>

				{!isLeftSide && isOutlineVisible && (
					<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-l">
						{collected.outline}
					</div>
				)}
			</div>
		);
	};

	const renderMobileContent = () => {
		return (
			<>
				{isOutlineVisible && (
					<div className="sticky top-0 z-20 flex flex-col bg-background shadow-sm">
						<div className="max-h-[30vh] shrink-0 overflow-y-auto border-b bg-muted/5">
							{collected.outline}
						</div>
					</div>
				)}
				<div className="flex-1">{collected.contentArea}</div>
			</>
		);
	};

	return (
		<ResponsiveLayout
			className={cn(
				"relative flex w-full flex-col",
				!isBlockStyle && "rounded-none border",
				className,
			)}
		>
			<DesktopView className="flex w-full flex-col">
				{renderDesktopContent()}
			</DesktopView>
			<MobileTabletView className="flex w-full flex-col">
				{renderMobileContent()}
			</MobileTabletView>
		</ResponsiveLayout>
	);
}

export function RichDisplay({
	content,
	children,
	className,
}: RichDisplayProps) {
	const [processedHtml, setProcessedHtml] = useState(content);
	const [toc, setToc] = useState<TocItem[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [outlineVisible, setOutlineVisible] = useState(false);
	const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(
		null,
	);
	const [style, setStyle] = useState<"block" | "inset">("block");

	const collected = useMemo(() => collectChildren(children), [children]);

	useEffect(() => {
		if (collected.outlineConfig) {
			setStyle(collected.outlineConfig.style);
		}
	}, [collected.outlineConfig]);

	useEffect(() => {
		if (!content) {
			setProcessedHtml("");
			setToc([]);
			return;
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(content, "text/html");
		const headings = doc.querySelectorAll("h1, h2, h3");
		const newToc: TocItem[] = [];
		const seenIds = new Set<string>();

		headings.forEach((h, index) => {
			let id = h.id;
			if (!id) {
				// Generate a simpler, cleaner ID based on text content if possible, fallback to index
				const textSlug = h.textContent
					?.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
				id = textSlug || `heading-${index}`;
			}

			// Ensure uniqueness
			let uniqueId = id;
			let counter = 1;
			while (seenIds.has(uniqueId)) {
				uniqueId = `${id}-${counter}`;
				counter++;
			}
			seenIds.add(uniqueId);
			h.id = uniqueId;

			newToc.push({
				id: uniqueId,
				text: h.textContent || "",
				level: Number.parseInt(h.tagName[1], 10),
			});
		});

		setToc(newToc);
		setProcessedHtml(doc.body.innerHTML);
	}, [content]);

	// Scrollspy for activeId
	useEffect(() => {
		if (toc.length === 0) return;

		const handleScroll = () => {
			// Viewport offset (reading line)
			const offset = 150;
			let currentActiveId: string | null = null;

			// Check all items
			for (const item of toc) {
				const element = document.getElementById(item.id);
				if (!element) continue;

				const rect = element.getBoundingClientRect();

				// Check if the element top is above the reading line
				if (rect.top < offset) {
					currentActiveId = item.id;
				} else {
					// If we found one below the line, we can stop,
					// assuming DOM order matches TOC order.
					break;
				}
			}

			if (currentActiveId) {
				setActiveId(currentActiveId);
			} else if (toc.length > 0) {
				// Fallback: If no header is above the line (e.g. at very top of page),
				// but the first header exists, make it active.
				setActiveId(toc[0].id);
			}
		};

		// Throttle scroll handler
		let ticking = false;
		const onScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		if (scrollContainer) {
			scrollContainer.addEventListener("scroll", onScroll, { passive: true });
		}

		// Initial check
		const timeoutId = setTimeout(handleScroll, 100);

		return () => {
			window.removeEventListener("scroll", onScroll);
			if (scrollContainer) {
				scrollContainer.removeEventListener("scroll", onScroll);
			}
			clearTimeout(timeoutId);
		};
	}, [toc, scrollContainer]);

	return (
		<RichDisplayContext.Provider
			value={{
				html: processedHtml,
				toc,
				activeId,
				outlineVisible,
				setOutlineVisible,
				scrollContainer,
				setScrollContainer,
				style,
			}}
		>
			<RichDisplayLayout className={className}>{children}</RichDisplayLayout>
		</RichDisplayContext.Provider>
	);
}
