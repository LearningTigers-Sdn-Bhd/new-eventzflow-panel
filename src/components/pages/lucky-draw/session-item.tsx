"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { cn } from "@/lib/utils";
import { ActionMenu } from "./action-menu";

interface SessionItemProps {
	session: LuckyDrawSession;
}

export function SessionItem({ session }: SessionItemProps) {
	// Style colors with background
	const styleColors: Record<string, string> = {
		wheel: "bg-blue-500 text-white border-blue-600",
		slot: "bg-purple-500 text-white border-purple-600",
		box: "bg-orange-500 text-white border-orange-600",
	};

	// Theme colors with background
	const themeColors: Record<string, string> = {
		wireframe: "bg-gray-500 text-white border-gray-600",
		colorful: "bg-pink-500 text-white border-pink-600",
		cartoon: "bg-yellow-500 text-white border-yellow-600",
	};

	return (
		<div className="flex flex-col space-y-4 rounded-none border bg-card p-4">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div className="relative h-12 w-12 overflow-hidden rounded-none border bg-muted">
						{session.logo_url ? (
							<img
								src={session.logo_url}
								alt={session.title}
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
				<ActionMenu session={session} />
			</div>

			{/* Styles and Themes */}
			<div className="flex flex-wrap gap-2">
				{session.draw_styles ? (
					<>
						<Badge
							className={cn(
								"rounded-none font-bold capitalize",
								styleColors[session.draw_styles.style] ||
									"bg-gray-500 text-white",
							)}
						>
							{session.draw_styles.style}
						</Badge>
						<Badge
							className={cn(
								"rounded-none font-bold capitalize",
								themeColors[session.draw_styles.theme] ||
									"bg-gray-500 text-white",
							)}
						>
							{session.draw_styles.theme}
						</Badge>
					</>
				) : (
					<span className="text-muted-foreground text-sm">No style</span>
				)}
			</div>

			<div className="flex items-center justify-between border-t pt-3">
				<span className="font-medium text-muted-foreground text-sm">
					Uses Gifts
				</span>
				<Badge
					variant="outline"
					className={cn(
						"rounded-none font-bold capitalize",
						session.use_gifts
							? "border-green-500 text-green-500"
							: "border-red-500 text-red-500",
					)}
				>
					{session.use_gifts ? "Yes" : "No"}
				</Badge>
			</div>
		</div>
	);
}
