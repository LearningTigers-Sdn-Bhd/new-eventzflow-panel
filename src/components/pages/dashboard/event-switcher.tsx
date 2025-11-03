"use client";

import {
	ArrowLeftRight,
	Check,
	ChevronDown,
	LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { EventOverview } from "@/lib/api/dashboard/response";

interface EventSwitcherProps {
	currentEventId: string | null;
	onEventChange: (eventId: string | null) => void;
	initialEvents?: EventOverview[];
}

export function EventSwitcher({
	currentEventId,
	onEventChange,
	initialEvents,
}: EventSwitcherProps) {
	const isMobile = useIsMobile();
	// Use the events passed from parent instead of fetching again
	// This avoids duplicate API calls and potential auth timing issues
	const events = initialEvents;

	const currentEvent = events?.find((e) => e.id === currentEventId);
	const eventCount = events?.length || 0;

	return (
		<Tooltip>
			<DropdownMenu>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="group relative w-full gap-2 rounded-none transition-all hover:border-primary/50 hover:bg-primary/5"
						>
							<ArrowLeftRight className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
							<span className="max-w-[200px] truncate font-medium">
								{currentEvent ? currentEvent.title : "All Events"}
							</span>
							{eventCount > 1 && (
								<Badge
									variant="secondary"
									className="ml-1 h-5 rounded-md! border-green-500/30 bg-green-500/10 px-1.5 text-green-700 text-xs"
								>
									{eventCount}
								</Badge>
							)}
							<ChevronDown className="h-4 w-4 opacity-50 transition-opacity group-hover:opacity-100" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side={isMobile ? "top" : "left"} sideOffset={10}>
					<p className="font-medium">Switch between events</p>
					<p className="mt-0.5 text-xs opacity-80">
						{eventCount > 1
							? `View any of your ${eventCount} events`
							: "Select an event to view"}
					</p>
				</TooltipContent>
				<DropdownMenuContent
					align={isMobile ? "center" : "end"}
					className="h-[430px] w-[calc(100vw-7rem)] rounded-none md:w-[300px]"
				>
					<DropdownMenuLabel>Switch Event</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => onEventChange(null)}
						className="cursor-pointer"
					>
						<div className="flex w-full items-center justify-between">
							<div className="flex items-center gap-2">
								<LayoutDashboard className="h-4 w-4" />
								<span>All Events Overview</span>
							</div>
							{!currentEventId && <Check className="h-4 w-4" />}
						</div>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{events?.map((event) => (
						<DropdownMenuItem
							key={event.id}
							onClick={() => onEventChange(event.id)}
							className="cursor-pointer"
						>
							<div className="flex w-full items-center justify-between">
								<div className="flex min-w-0 flex-1 items-center gap-2">
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium">{event.title}</div>
										<div className="mt-0.5 flex items-center gap-2">
											<Badge
												variant={
													event.status === "active" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{event.status}
											</Badge>
											<span className="text-muted-foreground text-xs">
												{event.totalTickets} tickets
											</span>
										</div>
									</div>
								</div>
								{currentEventId === event.id && (
									<Check className="ml-2 h-4 w-4 shrink-0" />
								)}
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</Tooltip>
	);
}
