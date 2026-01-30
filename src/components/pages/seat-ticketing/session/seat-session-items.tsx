"use client";

import { Calendar, Copy, MapPin } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-utils";
import { SeatSessionActionMenu } from "./seat-session-action-menu";
import type { SeatSessionRow } from "./seat-session-table-columns";
import { getSessionStatusConfig } from "./utils";

interface SeatSessionItemProps {
	session: SeatSessionRow;
}

export function SeatSessionItem({ session }: SeatSessionItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Session ID copied to clipboard",
	});
	const isMobile = useIsMobile();
	const isArchived = session.archived ?? !!session.deleted_at;
	const statusConfig = getSessionStatusConfig(session.status);

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				{!isMobile ? (
					<ItemTitle className="min-h-12 w-full justify-between">
						<h3 className="text-balance font-bold text-xl">
							{session.name}
						</h3>
					</ItemTitle>
				) : (
					<ItemTitle className="min-h-12 w-full justify-start">
						<div className="flex items-center gap-2 rounded-md border bg-muted p-2">
							<MapPin className="size-4 text-muted-foreground" />
						</div>
						<h3 className="text-balance font-bold text-xl">
							{session.name}
						</h3>
					</ItemTitle>
				)}
				<ItemDescription className="flex w-full justify-start gap-2">
					<span className="rounded-none bg-accent px-2 py-1 font-mono text-muted-foreground text-xs">
						ID: {session.id}
					</span>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 rounded-none hover:border"
						onClick={() => copyToClipboard(session.id)}
					>
						<Copy className="size-3" />
					</Button>
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<MapPin className="size-4 text-muted-foreground" />
					<h4 className="text-muted-foreground text-sm">
						{session.location || "Location not set"}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Calendar className="size-4 text-muted-foreground" />
					<h4 className="text-muted-foreground text-sm">
						{formatDateTime(session.start_datetime)}
					</h4>
				</div>
			<div className="flex flex-wrap items-center gap-2">
				<Badge
					variant="outline"
					className={cn("rounded-none", statusConfig.className)}
				>
					{statusConfig.label}
				</Badge>
				{isArchived && (
					<Badge
						variant="outline"
						className="rounded-none border-amber-500 bg-amber-50 text-amber-700"
					>
						Archived
					</Badge>
				)}
			</div>
		</ItemContent>
			<ItemFooter className="flex justify-end">
				<ItemActions>
					<SeatSessionActionMenu session={session} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
