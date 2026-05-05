"use client";

import { Copy } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useFormatDate } from "@/hooks/use-format-date";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { EventActionsMenu } from "./event-action-menu";
import type { Event } from "./event-table-columns";

interface EventItemProps {
	event: Event;
	onClick?: () => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Event ID copied to clipboard",
	});
	const { formatDate } = useFormatDate();
	const isMobile = useIsMobile();
	const touchStartRef = useRef<{ x: number; y: number } | null>(null);
	const isTouchScrollingRef = useRef(false);

	const handleTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
		isTouchScrollingRef.current = false;
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!touchStartRef.current) return;
		const touch = e.touches[0];
		const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
		const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
		if (deltaX > 8 || deltaY > 8) {
			isTouchScrollingRef.current = true;
		}
	};

	const handleTouchEnd = () => {
		// Reset after click phase completes
		setTimeout(() => {
			isTouchScrollingRef.current = false;
			touchStartRef.current = null;
		}, 0);
	};

	const handleItemClick = () => {
		if (isTouchScrollingRef.current) return;
		onClick?.();
	};

	const handleCopyId = (e: React.MouseEvent) => {
		e.stopPropagation();
		copyToClipboard(event.id.toString());
	};

	return (
		<Item
			variant="outline"
			className={cn(
				"h-full w-full rounded-none",
				onClick && "cursor-pointer transition-colors hover:bg-accent/50",
			)}
			onClick={onClick ? handleItemClick : undefined}
			onTouchStart={onClick ? handleTouchStart : undefined}
			onTouchMove={onClick ? handleTouchMove : undefined}
			onTouchEnd={onClick ? handleTouchEnd : undefined}
		>
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="min-h-12 w-full justify-between gap-12">
					<h3 className="text-balance font-bold text-lg tracking-tight">
						{event.title}
					</h3>
					{isMobile && (
						<Badge
							className={cn(
								"min-w-20 rounded-none font-bold capitalize",
								event.status === "published" && "bg-green-500",
								event.status === "draft" && "bg-yellow-500",
								event.status === "cancelled" && "bg-red-500",
								event.status === "completed" && "bg-blue-500",
							)}
						>
							{event.status}
						</Badge>
					)}
				</ItemTitle>
				<ItemDescription className="flex w-full justify-start gap-2">
					{!isMobile && (
						<Badge
							className={cn(
								"min-w-16 rounded-none font-bold capitalize",
								event.status === "published" && "bg-green-500",
								event.status === "draft" && "bg-yellow-500",
								event.status === "cancelled" && "bg-red-500",
								event.status === "completed" && "bg-blue-500",
							)}
						>
							{event.status}
						</Badge>
					)}
					<div className="flex items-center gap-2">
						<span className="bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
							ID: {event.id}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="ml-1 h-6 w-6 hover:border"
							onClick={handleCopyId}
						>
							<Copy className="size-3" />
						</Button>
					</div>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="flex flex-col">
				<div className="flex flex-col gap-0.5 text-sm">
					<span className="text-muted-foreground">
						<span className="font-semibold">Start:</span>{" "}
						{formatDate(event.start_date)}
					</span>
					<span className="text-muted-foreground">
						<span className="font-semibold">End:</span>{" "}
						{formatDate(event.end_date)}
					</span>
				</div>
				{event.description && (
					<span className="line-clamp-2 text-base text-secondary-foreground tracking-tighter">
						{event.description}
					</span>
				)}
			</ItemContent>
			<ItemFooter className="mt-6 flex justify-end">
				<ItemActions onClick={(e) => e.stopPropagation()}>
					<EventActionsMenu eventId={event.id} deletedAt={event.deleted_at} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
