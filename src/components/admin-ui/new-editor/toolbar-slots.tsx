"use client";

import type { ReactNode } from "react";

interface ToolbarLeftSlotProps {
	children?: ReactNode;
	className?: string;
}

interface ToolbarRightSlotProps {
	children?: ReactNode;
	className?: string;
}

export function ToolbarLeftSlot({ children, className }: ToolbarLeftSlotProps) {
	return <div className={className}>{children}</div>;
}

export function ToolbarRightSlot({
	children,
	className,
}: ToolbarRightSlotProps) {
	return <div className={className}>{children}</div>;
}
