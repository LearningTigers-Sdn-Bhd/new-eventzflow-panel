"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ToolbarButtonProps {
	onClick: () => void;
	isActive?: boolean;
	children: React.ReactNode;
	tooltip: string;
	disabled?: boolean;
	className?: string;
	size?: "sm" | "default";
	variant?: "ghost" | "secondary" | "destructive" | "outline" | "default";
}

export const ToolbarButton = ({
	onClick,
	isActive = false,
	children,
	tooltip,
	disabled = false,
	className = "",
	size = "sm",
	variant,
}: ToolbarButtonProps) => {
	return (
		<TooltipProvider delayDuration={400}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant={variant || (isActive ? "secondary" : "ghost")}
						size={size}
						onClick={onClick}
						disabled={disabled}
						className={cn("h-8 w-8 rounded-none p-0", className)}
					>
						{children}
					</Button>
				</TooltipTrigger>
				<TooltipContent
					side="bottom"
					className="rounded-none px-2 py-1 text-[10px]"
				>
					{tooltip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
