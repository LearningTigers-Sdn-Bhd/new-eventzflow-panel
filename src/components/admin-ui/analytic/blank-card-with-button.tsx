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
}

export function BlankCardWithButton({
	children,
	title,
	icon,
	buttonLabel,
	onButtonClick,
	buttonIcon,
	className,
}: BlankCardWithButtonProps) {
	return (
		<Card
			className={cn(
				"gap-0 rounded-none border border-border/90 border-x border-dashed p-0 shadow-none lg:border-l",
				className,
			)}
		>
			<CardHeader className="p-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{icon && <div className="border-r border-dashed p-4">{icon}</div>}
						{title && (
							<div className="flex flex-col gap-1 px-2 py-3">
								<CardTitle className="text-sm">{title}</CardTitle>
							</div>
						)}
					</div>
					{buttonLabel && (
						<div className="flex items-center gap-2 px-2">
							<Button
								className="rounded-none border bg-accent"
								variant="outline"
								size="sm"
								onClick={onButtonClick}
							>
								{buttonIcon && <span className="mr-2">{buttonIcon}</span>}
								{buttonLabel}
							</Button>
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="bg-accent p-0">{children}</CardContent>
		</Card>
	);
}
