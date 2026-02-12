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
			<div className="absolute right-4 top-4 flex items-center gap-3 border-2 border-slate-200 bg-white/95 p-3 text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md md:right-6 md:top-6 md:p-4 lg:text-xs z-10 rounded-none text-brand-green animate-in fade-in slide-in-from-top-2 duration-500">
				<MousePointer2Icon className="h-4 w-4" />
				Select a section to view available seats
			</div>
		);
	}

	const shades = getSectionShades(sectionColor || "blue");

	return (
		<div className="absolute right-4 top-4 flex flex-col gap-3 border-2 border-slate-200 bg-white/95 p-3 text-[9px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md md:right-6 md:top-6 md:p-4 md:text-[10px] lg:text-xs z-10 rounded-none text-slate-900 animate-in fade-in duration-300">
			<div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6">
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center bg-[#10b981] rounded-[2px]">
						<div className="h-[8px] w-[8px] bg-[#a7f3d0] rounded-[1px]" />
					</div>
					<span className="text-emerald-800">Selected</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center bg-[#f59e0b] rounded-[2px]">
						<div className="h-[8px] w-[8px] bg-[#fde68a] rounded-[1px]" />
					</div>
					<span className="text-amber-700">Locked</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="relative flex h-4 w-4 items-center justify-center bg-slate-400 rounded-[2px]">
						<div className="absolute h-[1px] w-3 bg-white rotate-45" />
						<div className="absolute h-[1px] w-3 bg-white -rotate-45" />
					</div>
					<span className="text-slate-500">Sold</span>
				</div>
			</div>

			<div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
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
