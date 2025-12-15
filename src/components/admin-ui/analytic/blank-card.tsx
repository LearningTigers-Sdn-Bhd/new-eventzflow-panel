"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BlankCardProps {
	children: React.ReactNode;
	title?: string;
	icon?: React.ReactNode;
	className?: string;
}

export function BlankCard({
	children,
	title,
	icon,
	className,
}: BlankCardProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			{(title || icon) && (
				<CardHeader className="p-0">
					<div className="flex items-center gap-4">
						{icon && <div className="border-r border-dashed p-4">{icon}</div>}
						{title && (
							<div className="flex flex-col gap-1 px-2 py-3">
								<CardTitle className="text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
				</CardHeader>
			)}
			<CardContent className="h-full bg-accent p-4">{children}</CardContent>
		</Card>
	);
}
