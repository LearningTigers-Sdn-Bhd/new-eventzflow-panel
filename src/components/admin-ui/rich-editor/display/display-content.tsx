"use client";

import parse, { Element } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRichDisplayContext } from "./context";
import "../styles.css";

interface RichDisplayContentProps {
	className?: string;
	children?: ReactNode;
}

export function RichDisplayContent({
	className,
	children,
}: RichDisplayContentProps) {
	const { html, setScrollContainer, style } = useRichDisplayContext();

	const parsedContent = useMemo(() => {
		const cleanHtml = DOMPurify.sanitize(html);

		return parse(cleanHtml, {
			replace: (domNode) => {
				if (domNode instanceof Element && domNode.name === "img") {
					const { src, alt, width, height, class: className } = domNode.attribs;

					// Parse dimensions, defaulting to something reasonable if missing/invalid
					// "inherit" comes from Lexical default, handle it
					const safeWidth =
						width && width !== "inherit" ? Number.parseInt(width, 10) : 1200;
					const safeHeight =
						height && height !== "inherit" ? Number.parseInt(height, 10) : 800;

					return (
						<Image
							src={src}
							alt={alt || ""}
							width={safeWidth}
							height={safeHeight}
							unoptimized // Keep unoptimized for external URLs until config is set
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
							className={cn("h-auto w-full object-cover", className)}
						/>
					);
				}
				return domNode;
			},
		});
	}, [html]);

	return (
		<div
			className={cn("flex-1 scroll-pt-20 overflow-auto bg-muted/20")}
			ref={setScrollContainer}
		>
			<div
				className={cn(
					"min-h-full w-full bg-background px-4 py-12 shadow-[0_0_1px_rgba(0,0,0,0.1)] md:px-12",
					style === "block" && "rounded-none border",
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
					</div>
				)}

				<div className="prose prose-sm dark:prose-invert max-w-none">
					{parsedContent}
				</div>
			</div>
		</div>
	);
}
