"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEventSidebarContext } from "./event-sidebar-provider";

export function EventMenuHeader() {
	const router = useRouter();
	const { events, currentEvent, isLoading } = useEventSidebarContext();
	const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
		null,
	);
	const setScrollRef = useCallback((node: HTMLDivElement | null) => {
		setScrollElement(node);
	}, []);

	// Handle event selection
	const handleEventSelect = (selectedEventId: string) => {
		router.push(`/event/${selectedEventId}/details`);
	};

	// Memoize initials to avoid re-calculation on every render
	const eventTitle = currentEvent?.title;
	const initials = useMemo(() => {
		if (!eventTitle) return "";
		return eventTitle
			.split(" ")
			.map((word) => word.charAt(0))
			.slice(0, 2)
			.join("");
	}, [eventTitle]);

	const sortedEvents = useMemo(() => {
		if (!events) return [];
		return [...events].sort(
			(a, b) =>
				new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
		);
	}, [events]);

	const rowHeight = 88;
	const virtualizer = useVirtualizer({
		count: sortedEvents.length,
		getScrollElement: () => scrollElement,
		estimateSize: () => rowHeight,
		overscan: 4,
	});

	// Loading state
	if (isLoading) {
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
											{initials}
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
									<ChevronDown className="size-4 shrink-0 opacity-50 transition-transform duration-300 group-data-[state=open]:-rotate-180" />
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="start"
							side="bottom"
							className="w-[250px] overflow-hidden rounded-none p-0"
						>
							<div
								ref={setScrollRef}
								className="h-[300px] overflow-y-auto overflow-x-hidden"
							>
								<div
									className="relative w-full"
									style={{ height: virtualizer.getTotalSize() }}
								>
									{virtualizer.getVirtualItems().map((virtualRow) => {
										const event = sortedEvents[virtualRow.index];
										if (!event) return null;
										const isLast = virtualRow.index === sortedEvents.length - 1;
										return (
											<div
												key={event.id}
												className="absolute top-0 left-0 w-full"
												style={{
													transform: `translateY(${virtualRow.start}px)`,
													height: rowHeight,
													contentVisibility: "auto",
													containIntrinsicSize: `${rowHeight}px`,
												}}
											>
												<DropdownMenuItem
													onClick={() => handleEventSelect(event.id.toString())}
													className={cn(
														"h-full cursor-pointer rounded-none py-4 hover:bg-sidebar-accent",
														!isLast && "border-border border-b",
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
											</div>
										);
									})}
								</div>
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
	);
}
