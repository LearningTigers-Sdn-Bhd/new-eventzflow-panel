"use client";

import { MousePointer2Icon } from "lucide-react";
import type { EventSeatGroup } from "@/lib/api/seat-ticketing/response";
import { getSectionShades } from "@/lib/utils/group-colors";

interface LegendProps {
	isVenueView?: boolean;
	sectionColor?: string | null;
	sectionPrice?: string | number | null;
	groups?: EventSeatGroup[];
}

export function Legend({
	isVenueView,
	sectionColor,
	sectionPrice,
	groups,
}: LegendProps) {
	if (isVenueView) {
		return (
			<div className="fade-in slide-in-from-top-2 absolute top-4 right-4 z-10 flex animate-in items-center gap-3 rounded-none border-2 border-slate-200 bg-white/95 p-3 font-black text-[10px] text-brand-green uppercase tracking-widest shadow-2xl backdrop-blur-md duration-500 md:top-6 md:right-6 md:p-4 lg:text-xs">
				<MousePointer2Icon className="h-4 w-4" />
				Select a section to view available seats
			</div>
		);
	}

	const shades = getSectionShades(sectionColor || "blue");

	return (
		<div className="fade-in absolute top-4 right-4 z-10 flex animate-in flex-col gap-3 rounded-none border-2 border-slate-200 bg-white/95 p-3 font-black text-[9px] text-slate-900 uppercase tracking-widest shadow-2xl backdrop-blur-md duration-300 md:top-6 md:right-6 md:p-4 md:text-[10px] lg:text-xs">
			<div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6">
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center rounded-[2px] bg-[#10b981]">
						<div className="h-[8px] w-[8px] rounded-[1px] bg-[#a7f3d0]" />
					</div>
					<span className="text-emerald-800">Selected</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center rounded-[2px] bg-[#f59e0b]">
						<div className="h-[8px] w-[8px] rounded-[1px] bg-[#fde68a]" />
					</div>
					<span className="text-amber-700">Locked</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center rounded-[2px] bg-slate-400">
						<div className="absolute h-[1px] w-3 rotate-45 bg-white" />
						<div className="absolute h-[1px] w-3 -rotate-45 bg-white" />
					</div>
					<span className="text-slate-500">Sold</span>
				</div>
			</div>

			<div className="flex flex-col gap-2 border-slate-200 border-t pt-2">
				<div className="flex items-center gap-2">
					<div className="h-4 w-4" style={{ backgroundColor: shades[500] }} />
					<span className="opacity-70">
						Available (RM{Number(sectionPrice || 0).toFixed(2)})
					</span>
				</div>

				{groups?.map((group) => {
					const groupShades = getSectionShades(group.color);
					return (
						<div key={group.id} className="flex items-center gap-2">
							<div
								className="h-4 w-4"
								style={{ backgroundColor: groupShades[500] }}
							/>
							<span className="opacity-70">
								{group.name} (RM
								{(
									Number(sectionPrice || 0) + Number(group.extra_price || 0)
								).toFixed(2)}
								)
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
