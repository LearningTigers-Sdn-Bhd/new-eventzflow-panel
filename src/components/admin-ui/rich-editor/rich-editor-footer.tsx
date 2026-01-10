"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RichEditorFooterProps {
	children?: ReactNode;
	className?: string;
}

export function RichEditorFooter({
	children,
	className,
}: RichEditorFooterProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-muted-foreground text-xs",
				className,
			)}
		>
			{children}
		</div>
	);
}
