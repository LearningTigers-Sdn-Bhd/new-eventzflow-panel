"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRichDisplayContext } from "./context";
import "../styles.css"; // Reuse editor styles if needed, or rely on prose

interface RichDisplayContentProps {
	className?: string;
	children?: ReactNode;
}

export function RichDisplayContent({
	className,
	children,
}: RichDisplayContentProps) {
	const { html, setScrollContainer, style } = useRichDisplayContext();

	return (
		<div
			className={cn(
				"flex-1 scroll-pt-20 overflow-auto bg-muted/20",
				style === "block" && "rounded-none border",
			)}
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
					</div>
				)}

				<div
					className="prose prose-sm dark:prose-invert max-w-none"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted content from editor
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
		</div>
	);
}
