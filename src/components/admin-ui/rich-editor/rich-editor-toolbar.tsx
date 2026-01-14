"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { InsertImageToolbarButton } from "./plugins/insert-image-toolbar-button";
import { ToolbarPlugin } from "./plugins/toolbar-plugin";
import { ToolbarLeftSlot, ToolbarRightSlot } from "./toolbar-slots";

interface RichEditorToolbarProps {
	children?: ReactNode;
	className?: string;
}

export function RichEditorToolbar({
	children,
	className,
}: RichEditorToolbarProps) {
	const childrenArray = React.Children.toArray(children);
	const leftSlot = childrenArray.find(
		(child) => React.isValidElement(child) && child.type === ToolbarLeftSlot,
	);
	const rightSlot = childrenArray.find(
		(child) => React.isValidElement(child) && child.type === ToolbarRightSlot,
	);
	const otherChildren = childrenArray.filter(
		(child) =>
			React.isValidElement(child) &&
			child.type !== ToolbarLeftSlot &&
			child.type !== ToolbarRightSlot,
	);

	return (
		<div className={cn("sticky top-0 z-10 border-b bg-background p-2", className)}>
			<div className="flex items-center gap-1">
				{leftSlot}
				<ToolbarPlugin>
					<InsertImageToolbarButton />
					{otherChildren}
				</ToolbarPlugin>
				{rightSlot}
			</div>
		</div>
	);
}
