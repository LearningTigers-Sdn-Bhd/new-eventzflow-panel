"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { getGroupColorHex, getSectionShades } from "@/lib/utils/group-colors";
import {
	usePublicSeatActions,
	usePublicSeatHydrationState,
	usePublicSeatSectionState,
	usePublicSeatSelectedState,
} from "../hooks/use-public-seat-reservation";
import { CheckoutSeatCard } from "./checkout-seat-card";

interface AccessibleSeatPickerListProps {
	variant: "desktop" | "mobile";
}

export function AccessibleSeatPickerList({
	variant,
}: AccessibleSeatPickerListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const { sections, activeSectionId } = usePublicSeatSectionState();
	const { seats, hydratedSectionIds } = usePublicSeatHydrationState();
	const { selectedSeatIds } = usePublicSeatSelectedState();
	const { toggleSeat } = usePublicSeatActions();

	const activeSection = activeSectionId ? sections[activeSectionId] : null;

	const groupMap = useMemo(() => {
		const map = new Map<number, { name: string; color?: string | null }>();
		for (const group of activeSection?.event_seat_groups ?? []) {
			map.set(group.id, { name: group.name, color: group.color });
		}
		return map;
	}, [activeSection?.event_seat_groups]);

	const sectionSeats = useMemo(() => {
		if (!activeSectionId) return [];

		return Object.values(seats)
			.filter((seat) => seat.event_seat_section_id === activeSectionId)
			.sort((a, b) => {
				const rowDiff = (a.row_set || 0) - (b.row_set || 0);
				if (rowDiff !== 0) return rowDiff;
				const colDiff = (a.col_set || 0) - (b.col_set || 0);
				if (colDiff !== 0) return colDiff;
				return a.name.localeCompare(b.name);
			});
	}, [activeSectionId, seats]);

	const rowVirtualizer = useVirtualizer({
		count: sectionSeats.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => 86,
		overscan: 8,
	});

	const isHydrated = activeSectionId
		? hydratedSectionIds.has(activeSectionId)
		: false;

	if (!activeSectionId || !activeSection) {
		return (
			<p className="px-4 pb-4 text-slate-500 text-xs">
				Select a section from venue map first.
			</p>
		);
	}

	if (!isHydrated) {
		return (
			<p className="px-4 pb-4 text-slate-500 text-xs">
				Loading section seats...
			</p>
		);
	}

	return (
		<div
			ref={scrollRef}
			className={cn(
				"overflow-y-auto",
				variant === "mobile" ? "h-full px-3 pb-3" : "max-h-80 px-4 pb-3",
			)}
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					position: "relative",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualItem) => {
					const seat = sectionSeats[virtualItem.index];
					if (!seat) return null;

					const groupId = seat.event_seat_group_assignment?.event_seat_group_id;
					const group = groupId ? groupMap.get(groupId) : null;
					const isSelected = selectedSeatIds.has(seat.id);
					const isInteractive = seat.status === "available" || isSelected;

					const sectionName = group
						? `${activeSection.name} - ${group.name}`
						: activeSection.name;
					const sectionNameColor = group?.color
						? getGroupColorHex(group.color, 700)
						: getSectionShades(activeSection.color)[700];

					const priceValue = (
						Number(activeSection.price || 0) + Number(seat.extra_price || 0)
					).toFixed(2);

					return (
						<div
							key={seat.id}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
							}}
							className="py-1"
						>
							<button
								type="button"
								onClick={() => void toggleSeat(seat.id)}
								disabled={!isInteractive}
								className="block w-full cursor-pointer text-left disabled:cursor-not-allowed"
								aria-pressed={isSelected}
							>
								<CheckoutSeatCard
									showRemoveButton={false}
									selected={isSelected}
									disabled={!isInteractive}
									sectionName={sectionName}
									sectionNameColor={sectionNameColor}
									seatName={seat.name}
									price={`RM${priceValue}`}
								/>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
