"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BlankCardProps {
	children: React.ReactNode;
	title?: string;
	icon?: React.ReactNode;
	className?: string;
	contentClassName?: string;
}

export function BlankCard({
	children,
	title,
	icon,
	className,
	contentClassName,
}: BlankCardProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			{(title || icon) && (
				<CardHeader className="flex h-21 items-center p-0">
					<div className="flex h-full items-center gap-4">
						{icon && (
							<div className="flex h-full items-center border-r border-dashed p-4">
								{icon}
							</div>
						)}
						{title && (
							<div className="flex h-full items-center gap-1 px-2">
								<CardTitle className="text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
				</CardHeader>
			)}
			<CardContent className={cn("h-full bg-accent p-4", contentClassName)}>
				{children}
			</CardContent>
		</Card>
	);
}
