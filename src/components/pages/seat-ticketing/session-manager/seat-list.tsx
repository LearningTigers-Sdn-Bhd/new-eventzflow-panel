"use client";

import { Armchair, MousePointer2, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
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
import { useSeatSessionStore } from "./store/use-seat-session-store";

export function SeatList() {
	const selectedSectionId = useSeatSessionStore(
		(state) => state.selectedSectionId,
	);
	const section = useSeatSessionStore((state) =>
		selectedSectionId ? state.sections[selectedSectionId] : null,
	);

	const selectSeat = useSeatSessionStore((state) => state.selectSeat);
	const removeSeat = useSeatSessionStore((state) => state.removeSeat);
	const activeGroupId = useSeatSessionStore((state) => state.activeGroupId);
	const setGroupPaintingMode = useSeatSessionStore(
		(state) => state.setGroupPaintingMode,
	);
	const selectedSeatIds = useSeatSessionStore((state) => state.selectedSeatIds);
	const interactionMode = useSeatSessionStore((state) => state.interactionMode);
	const setInteractionMode = useSeatSessionStore(
		(state) => state.setInteractionMode,
	);

	const allSeats = useSeatSessionStore((state) => state.seats);
	const seats = useMemo(
		() =>
			Object.values(allSeats).filter(
				(s) => s.event_seat_section_id === selectedSectionId,
			),
		[allSeats, selectedSectionId],
	);

	if (!section) return null;

	const groups = section.event_seat_groups || [];

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
						<SidebarGroupLabel className="group/label mb-2 flex items-center justify-between px-0 font-bold uppercase tracking-wider">
							<div className="flex items-center gap-2 text-primary">
								<div className={cn("h-3 w-3 rounded-full", groupColor)} />
								{group.name}
								<Badge
									variant="outline"
									className="ml-1 h-4 rounded-none font-mono text-[10px]"
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
											"mt-1 h-9 gap-2 rounded-none border border-dashed transition-all",
											isPainting
												? "animate-pulse border-primary bg-primary text-primary-foreground hover:bg-primary/90"
												: "border-primary/20 text-primary hover:bg-primary/5",
										)}
									>
										{isPainting ? (
											<>
												<MousePointer2 className="h-3.5 w-3.5 animate-bounce" />
												<span className="font-medium text-[10px] uppercase">
													Stop Painting Seats
												</span>
											</>
										) : (
											<>
												<Plus className="h-3.5 w-3.5" />
												<span className="font-medium text-[10px] uppercase">
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
				<SidebarGroupLabel className="mb-2 flex items-center gap-2 px-0 font-bold uppercase tracking-wider">
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
									"mt-1 h-9 gap-2 rounded-none border border-dashed",
									interactionMode === "create"
										? "border-primary bg-primary text-primary-foreground"
										: "border-border text-muted-foreground hover:bg-muted",
								)}
							>
								<Plus className="h-3.5 w-3.5" />
								<span className="font-medium text-[10px] uppercase">
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
					"h-9 justify-between rounded-none pr-8",
					isSelected && "border-primary border-l-2 bg-primary/5",
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
					className="h-4 rounded-none font-mono font-normal text-[10px]"
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
				className="text-destructive hover:bg-destructive/10 hover:text-destructive"
			>
				<Trash2 className="h-3 w-3" />
			</SidebarMenuAction>
		</SidebarMenuItem>
	);
}
