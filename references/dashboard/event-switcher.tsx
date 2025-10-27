"use client";

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
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, LayoutDashboard, ArrowLeftRight } from "lucide-react";

interface EventSwitcherProps {
	currentEventId: string | null;
	onEventChange: (eventId: string | null) => void;
}

export function EventSwitcher({
	currentEventId,
	onEventChange,
}: EventSwitcherProps) {
	const { data: events } = useQuery(
		trpc.dashboard.getEventsOverview.queryOptions(),
	);

	const currentEvent = events?.find((e) => e.id === currentEventId);
	const eventCount = events?.length || 0;

	return (
		<Tooltip>
			<DropdownMenu>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button 
							variant="outline" 
							className="gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all relative group"
						>
							<ArrowLeftRight className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
							<span className="max-w-[200px] truncate font-medium">
								{currentEvent ? currentEvent.title : "All Events"}
							</span>
							{eventCount > 1 && (
								<Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
									{eventCount}
								</Badge>
							)}
							<ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={10}>
					<p className="font-medium">Switch between events</p>
					<p className="text-xs opacity-80 mt-0.5">
						{eventCount > 1 
							? `View any of your ${eventCount} events` 
							: "Select an event to view"}
					</p>
				</TooltipContent>
			<DropdownMenuContent align="start" className="w-[300px]">
				<DropdownMenuLabel>Switch Event</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => onEventChange(null)}
					className="cursor-pointer"
				>
					<div className="flex items-center justify-between w-full">
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
						<div className="flex items-center justify-between w-full">
							<div className="flex items-center gap-2 flex-1 min-w-0">
								<div className="flex-1 min-w-0">
									<div className="font-medium truncate">{event.title}</div>
									<div className="flex items-center gap-2 mt-0.5">
										<Badge
											variant={event.status === "active" ? "default" : "secondary"}
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
								<Check className="h-4 w-4 ml-2 flex-shrink-0" />
							)}
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
		</Tooltip>
	);
}
