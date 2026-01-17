"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStyleColor, getThemeColor } from "./draw-style-colors";

interface StyleThemeBadgesProps {
	style?: string | null;
	theme?: string | null;
	variant?: "table" | "card";
	className?: string;
}

/**
 * Component for rendering style and theme badges
 * Used in both table columns and session item cards
 */
export function StyleThemeBadges({
	style,
	theme,
	variant = "table",
	className,
}: StyleThemeBadgesProps) {
	if (!style || !theme) {
		return (
			<span className={cn("text-muted-foreground text-sm", className)}>
				No style
			</span>
		);
	}

	const withBorder = variant === "card";

	if (variant === "table") {
		return (
			<div className={cn("flex items-center", className)}>
				<Badge
					className={cn(
						"rounded-none border-0 px-3 font-bold capitalize",
						getStyleColor(style, withBorder),
					)}
				>
					{style}
				</Badge>
				<Badge
					className={cn(
						"rounded-none border-0 px-3 font-bold text-xs capitalize",
						getThemeColor(theme, withBorder),
					)}
				>
					{theme}
				</Badge>
			</div>
		);
	}

	// Card variant
	return (
		<div className={cn("flex flex-wrap gap-2", className)}>
			<Badge
				className={cn(
					"rounded-none font-bold capitalize",
					getStyleColor(style, withBorder),
				)}
			>
				{style}
			</Badge>
			<Badge
				className={cn(
					"rounded-none font-bold capitalize",
					getThemeColor(theme, withBorder),
				)}
			>
				{theme}
			</Badge>
		</div>
	);
}
