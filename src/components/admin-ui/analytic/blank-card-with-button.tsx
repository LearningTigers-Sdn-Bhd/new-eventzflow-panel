"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BlankCardWithButtonProps {
	children: React.ReactNode;
	title?: string;
	icon?: React.ReactNode;
	buttonLabel?: string;
	onButtonClick?: () => void;
	buttonIcon?: React.ReactNode;
	className?: string;
	contentClassName?: string;
}

export function BlankCardWithButton({
	children,
	title,
	icon,
	buttonLabel,
	onButtonClick,
	buttonIcon,
	className,
	contentClassName,
}: BlankCardWithButtonProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			<CardHeader className="flex h-16 w-full items-center p-0">
				<div className="flex h-full w-full items-center justify-between">
					<div className="flex h-full items-center gap-4">
						{icon && (
							<div className="flex h-full items-center border-r border-dashed p-4">
								{icon}
							</div>
						)}
						{title && (
							<div className="flex h-full items-center gap-1 px-2">
								<CardTitle className="line-clamp-1 text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
					{buttonLabel && (
						<div className="flex h-full items-center gap-2 px-2">
							<Button
								className="rounded-none border bg-accent"
								variant="outline"
								size="sm"
								onClick={onButtonClick}
							>
								{buttonIcon && <span className="mr-2">{buttonIcon}</span>}
								<span className="line-clamp-1 truncate">{buttonLabel}</span>
							</Button>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className={cn("bg-accent p-0", contentClassName)}>
				{children}
			</CardContent>
		</Card>
	);
}
