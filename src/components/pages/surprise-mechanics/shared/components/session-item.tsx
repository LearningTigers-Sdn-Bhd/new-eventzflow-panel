"use client";

import { Image } from "@unpic/react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BaseSession, SessionBadgeConfig } from "../types";
import { StyleThemeBadges } from "../utils/session-badge";

interface BaseSessionItemProps<T extends BaseSession> {
	session: T;
	badgeConfig: SessionBadgeConfig;
	actionMenuComponent: React.ComponentType<{ session: T }>;
}

/**
 * Generic session item component for displaying session cards
 * Used in mobile/tablet views of both roulette and lucky-draw tables
 */
export function BaseSessionItem<T extends BaseSession>({
	session,
	badgeConfig,
	actionMenuComponent: ActionMenuComponent,
}: BaseSessionItemProps<T>) {
	return (
		<div className="flex flex-col space-y-4 rounded-none border bg-card p-4">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="relative h-12 w-12 overflow-hidden rounded-none border bg-muted">
						{session.logo_url ? (
							<Image
								src={session.logo_url}
								alt={session.title}
								width={48}
								height={48}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
								NA
							</div>
						)}
					</div>
					<div>
						<h3 className="line-clamp-1 font-semibold text-base">
							{session.title}
						</h3>
						<p className="text-muted-foreground text-sm">
							{session.draw_date
								? format(new Date(session.draw_date), "PPP")
								: "No date"}
						</p>
					</div>
				</div>
				<ActionMenuComponent session={session} />
			</div>

			{/* Styles and Themes */}
			<StyleThemeBadges
				style={session.draw_styles?.style}
				theme={session.draw_styles?.theme}
				variant="card"
			/>

			<div className="flex items-center justify-between border-t pt-3">
				<span className="font-medium text-muted-foreground text-sm">
					{badgeConfig.label}
				</span>
				<Badge
					variant="outline"
					className={cn(
						"rounded-none font-bold capitalize",
						badgeConfig.value
							? "border-green-500 text-green-500"
							: "border-red-500 text-red-500",
					)}
				>
					{badgeConfig.value ? "Yes" : "No"}
				</Badge>
			</div>
		</div>
	);
}
