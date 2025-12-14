"use client";

import { Copy } from "lucide-react";
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
import { EventActionsMenu } from "./action-menu";
import type { Event } from "./columns";

interface EventItemProps {
	event: Event;
}

export function EventItem({ event }: EventItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Event ID copied to clipboard",
	});
	const { formatDate } = useFormatDate();
	const isMobile = useIsMobile();
	const handleCopyId = () => {
		copyToClipboard(event.id.toString());
	};

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
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
				<span className="text-muted-foreground text-sm tracking-wide">
					Created on {formatDate(event.created_at)}
				</span>
				{event.description && (
					<span className="line-clamp-2 text-base text-secondary-foreground tracking-tighter">
						{event.description}
					</span>
				)}
			</ItemContent>
			<ItemFooter className="mt-6 flex justify-end">
				<ItemActions>
					<EventActionsMenu eventId={event.id} deletedAt={event.deleted_at} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
