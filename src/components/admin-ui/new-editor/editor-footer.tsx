"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EditorFooterProps {
	children?: ReactNode;
	className?: string;
}

export function EditorFooter({ children, className }: EditorFooterProps) {
	return (
		<div
			className={cn(
				"flex min-h-10 shrink-0 items-center gap-1 border-t bg-background px-1 py-2",
				className,
			)}
		>
			{children}
		</div>
	);
}
