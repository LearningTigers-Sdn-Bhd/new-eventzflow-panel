"use client";

import { Armchair, MousePointer2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { EventTicketSeat } from "@/lib/api/seat-ticketing/response";
import { cn } from "@/lib/utils";
import { getGroupColor } from "@/lib/utils/group-colors";
import { useSeatSessionStore } from "./use-seat-session-store";

export function SeatList() {
	const {
		session,
		selectedSectionId,
		selectSeat,
		removeSeat,
		activeGroupId,
		setGroupPaintingMode,
		selectedSeatIds,
		interactionMode,
		setInteractionMode,
	} = useSeatSessionStore();

	const section = session?.event_seat_venues?.[0]?.event_seat_sections?.find(
		(s) => s.id === selectedSectionId,
	);

	if (!section) return null;

	const groups = section.event_seat_groups || [];
	const seats = section.event_ticket_seats || [];

	const unassignedSeats = seats.filter((s) => !s.event_seat_group_assignment);

	return (
		<div className="space-y-6">
			{/* Pricing Groups */}
			{groups.map((group) => {
				const groupSeats = seats.filter(
					(s) =>
						s.event_seat_group_assignment?.event_seat_group_id === group.id,
				);
				const isPainting = activeGroupId === group.id;
				const groupColor = getGroupColor(group.color);

				return (
					<SidebarGroup key={group.id} className="p-0">
						<SidebarGroupLabel className="px-0 mb-2 flex items-center justify-between group/label uppercase font-bold tracking-wider">
							<div className="flex items-center gap-2 text-primary">
								<div className={cn("w-3 h-3 rounded-full", groupColor)} />
								{group.name}
								<Badge
									variant="outline"
									className="ml-1 text-[10px] h-4 rounded-none font-mono"
								>
									+${group.extra_price}
								</Badge>
							</div>
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{groupSeats.map((seat) => (
									<SeatItem
										key={seat.id}
										seat={seat}
										isSelected={selectedSeatIds.includes(seat.id)}
										onSelect={() => selectSeat(seat.id)}
										onRemove={() => removeSeat(seat.id)}
									/>
								))}
								<SidebarMenuItem>
									<SidebarMenuButton
										onClick={() =>
											setGroupPaintingMode(isPainting ? null : group.id)
										}
										className={cn(
											"gap-2 h-9 rounded-none border border-dashed mt-1 transition-all",
											isPainting
												? "bg-primary text-primary-foreground border-primary animate-pulse hover:bg-primary/90"
												: "text-primary border-primary/20 hover:bg-primary/5",
										)}
									>
										{isPainting ? (
											<>
												<MousePointer2 className="h-3.5 w-3.5 animate-bounce" />
												<span className="font-medium uppercase text-[10px]">
													Stop Painting Seats
												</span>
											</>
										) : (
											<>
												<Plus className="h-3.5 w-3.5" />
												<span className="font-medium uppercase text-[10px]">
													Assign More Seats
												</span>
											</>
										)}
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				);
			})}

			{/* Unassigned Seats */}
			<SidebarGroup className="p-0">
				<SidebarGroupLabel className="px-0 mb-2 flex items-center gap-2 uppercase font-bold tracking-wider">
					<MousePointer2 className="h-4 w-4" />
					UNASSIGNED SEATS ({unassignedSeats.length})
				</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{unassignedSeats.map((seat) => (
							<SeatItem
								key={seat.id}
								seat={seat}
								isSelected={selectedSeatIds.includes(seat.id)}
								onSelect={() => selectSeat(seat.id)}
								onRemove={() => removeSeat(seat.id)}
							/>
						))}
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={() => {
									setInteractionMode(
										interactionMode === "create" ? "select" : "create",
									);
								}}
								className={cn(
									"gap-2 h-9 rounded-none border border-dashed mt-1",
									interactionMode === "create"
										? "bg-primary text-primary-foreground border-primary"
										: "text-muted-foreground border-border hover:bg-muted",
								)}
							>
								<Plus className="h-3.5 w-3.5" />
								<span className="font-medium uppercase text-[10px]">
									{interactionMode === "create"
										? "Cancel Create Mode"
										: "Place New Seat"}
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</div>
	);
}

function SeatItem({
	seat,
	isSelected,
	onSelect,
	onRemove,
}: {
	seat: EventTicketSeat;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
}) {
	return (
		<SidebarMenuItem className="group/item">
			<SidebarMenuButton
				onClick={onSelect}
				className={cn(
					"justify-between h-9 rounded-none pr-8",
					isSelected && "bg-primary/5 border-l-2 border-primary",
				)}
			>
				<div className="flex items-center gap-2 truncate">
					<Armchair
						className={cn(
							"h-3 w-3",
							isSelected ? "text-primary" : "text-slate-400",
						)}
					/>
					<span
						className={cn("truncate", isSelected && "font-medium text-primary")}
					>
						{seat.name}
					</span>
				</div>
				<Badge
					variant="outline"
					className="text-[10px] h-4 font-mono font-normal rounded-none"
				>
					{seat.row_set}:{seat.col_set}
				</Badge>
			</SidebarMenuButton>
			<SidebarMenuAction
				showOnHover
				onClick={(e) => {
					e.stopPropagation();
					onRemove();
				}}
				className="text-destructive hover:text-destructive hover:bg-destructive/10"
			>
				<Trash2 className="h-3 w-3" />
			</SidebarMenuAction>
		</SidebarMenuItem>
	);
}
