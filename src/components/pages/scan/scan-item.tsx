"use client";

import { Calendar, Clock, Copy, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-helpers";
import type { ScanResult } from "./types";

interface ScanItemProps {
	scanResult: ScanResult;
	isRecent?: boolean;
}

export function ScanItem({ scanResult, isRecent = false }: ScanItemProps) {
	const { copyToClipboard } = useCopyToClipboard({
		successMessage: "Ticket ID copied to clipboard",
	});

	const handleCopyTicketId = () => {
		copyToClipboard(scanResult.ticketId);
	};

	const formattedTime = scanResult.timestamp.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return (
		<Item
			variant="outline"
			className={cn(
				"h-full w-full transition-colors",
				isRecent && "animate-pulse bg-primary/5",
			)}
		>
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="w-full">
					<h3 className="text-balance font-bold text-lg">
						{scanResult.attendeeName || "Unknown"}
					</h3>
				</ItemTitle>
				<ItemDescription className="flex w-full flex-col gap-1">
					{scanResult.ticketId && (
						<div className="flex w-full items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								className="group rounded-none bg-accent p-0! px-2! hover:bg-transparent"
								onClick={handleCopyTicketId}
							>
								<span className="font-mono text-[10px] text-muted-foreground group-hover:underline sm:text-xs">
									ID: {scanResult.ticketId}
								</span>
								<Copy className="size-2.5 sm:size-3" />
							</Button>
						</div>
					)}
				</ItemDescription>
			</ItemHeader>
			<ItemContent className="flex flex-col">
				{scanResult.eventName && (
					<div className="flex items-center gap-2">
						<Calendar className="size-4 text-muted-foreground" />
						<span className="ml-1 text-muted-foreground text-sm">
							{scanResult.eventName}
						</span>
					</div>
				)}
				{scanResult.ticketType && (
					<div className="flex items-center gap-2">
						<Ticket className="size-4 text-muted-foreground" />
						<span className="text-muted-foreground text-sm">
							{scanResult.ticketType}
						</span>
					</div>
				)}
				<div className="flex items-center gap-2">
					<Clock className="size-4 text-muted-foreground" />
					<span className="text-muted-foreground text-sm">
						Checked in at {formattedTime}
					</span>
				</div>
			</ItemContent>
			<ItemFooter className="flex justify-end">
				<StatusBadge
					status={scanResult.status}
					message={scanResult.message}
					className="rounded-none"
				/>
			</ItemFooter>
		</Item>
	);
}
