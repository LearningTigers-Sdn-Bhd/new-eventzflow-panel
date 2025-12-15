"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { getEvents } from "@/lib/api/event";
import type { Event } from "@/lib/api/event/response";
import { cn } from "@/lib/utils";

interface EventMenuHeaderProps {
	eventId: string;
	onEventsLoaded?: (events: Event[], currentEvent: Event | undefined) => void;
}

export function EventMenuHeader({
	eventId,
	onEventsLoaded,
}: EventMenuHeaderProps) {
	const router = useRouter();

	// Fetch events
	const { data: events, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["events"],
		queryFn: () => getEvents(),
	});

	// Get current event
	const currentEvent = useMemo(() => {
		return events?.find((event) => event.id.toString() === eventId);
	}, [events, eventId]);

	// Notify parent component when events are loaded
	useEffect(() => {
		if (events && onEventsLoaded) {
			onEventsLoaded(events, currentEvent);
		}
	}, [events, currentEvent, onEventsLoaded]);

	// Handle event selection
	const handleEventSelect = (selectedEventId: string) => {
		router.push(`/event/${selectedEventId}/location`);
	};

	// Loading state
	if (isLoadingEvents) {
		return (
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuSkeleton showIcon />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
		);
	}

	// No data state
	if (!events || !currentEvent) {
		return null;
	}

	return (
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="group h-full rounded-none border p-4 focus-visible:ring-0"
								tooltip="Switch Event"
							>
								<div className="flex items-center gap-2">
									<Avatar className="rounded-none">
										<AvatarFallback className="rounded-none bg-amber-200 font-bold text-xs">
											{/* Split by space and get first character of each 2 words */}
											{currentEvent.title
												.split(" ")
												.map((word) => word.charAt(0))
												.slice(0, 2)
												.join("")}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex w-full flex-1 flex-col items-start overflow-hidden group-data-[state=open]:block group-data-[state=collapsed]:hidden">
									<h3 className="line-clamp-2 truncate text-balance font-semibold text-sm">
										{currentEvent.title}
									</h3>
									<div className="flex items-center gap-1">
										<Badge
											className={cn(
												"h-4 rounded-none px-1 text-[10px] capitalize",
												currentEvent.status === "published" &&
													"bg-green-500 text-white",
												currentEvent.status === "draft" &&
													"bg-yellow-500 text-white",
												currentEvent.status === "cancelled" &&
													"bg-red-500 text-white",
												currentEvent.status === "completed" &&
													"bg-blue-500 text-white",
											)}
										>
											{currentEvent.status}
										</Badge>
										<Badge
											className={cn(
												"h-4 rounded-none px-1 text-[10px] capitalize",
												currentEvent.use_ticket !== false
													? "bg-purple-500 text-white"
													: "bg-cyan-500 text-white",
											)}
										>
											{currentEvent.use_ticket !== false
												? "Ticket Event"
												: "Visitor Event"}
										</Badge>
									</div>
								</div>
								<div className="flex items-center justify-end gap-2 group-data-[state=open]:block group-data-[state=collapsed]:hidden">
									<ChevronDown className="group-data-[state=open]:-rotate-180 size-4 shrink-0 opacity-50 transition-transform duration-300" />
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="start"
							side="bottom"
							className="w-[250px] rounded-none"
						>
							<ScrollArea className="h-[300px]">
								{events.map((event) => (
									<DropdownMenuItem
										key={event.id}
										onClick={() => handleEventSelect(event.id.toString())}
										className={cn(
											"cursor-pointer rounded-none py-4 hover:bg-sidebar-accent",
											currentEvent.id === event.id &&
												"bg-sidebar-accent hover:bg-sidebar-accent-foreground/30",
										)}
									>
										<div className="flex flex-1 flex-col gap-1">
											<div className="flex flex-col items-start justify-start gap-2">
												<h3
													className={cn(
														"line-clamp-2 truncate text-balance font-semibold text-sm",
														currentEvent.id === event.id &&
															"font-bold text-sidebar-accent-foreground hover:text-sidebar-accent-foreground",
													)}
												>
													{event.title}
												</h3>
												<div className="flex items-center gap-2">
													<Badge
														className={cn(
															"h-4 rounded-none text-[10px] capitalize",
															event.status === "published" &&
																"bg-green-500 text-white",
															event.status === "draft" &&
																"bg-yellow-500 text-white",
															event.status === "cancelled" &&
																"bg-red-500 text-white",
															event.status === "completed" &&
																"bg-blue-500 text-white",
														)}
													>
														{event.status}
													</Badge>
													<Badge
														className={cn(
															"h-4 rounded-none text-[10px] capitalize",
															event.use_ticket !== false
																? "bg-purple-500 text-white"
																: "bg-cyan-500 text-white",
														)}
													>
														{event.use_ticket !== false
															? "Ticket Event"
															: "Visitor Event"}
													</Badge>
												</div>
											</div>
										</div>
									</DropdownMenuItem>
								))}
							</ScrollArea>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
}
