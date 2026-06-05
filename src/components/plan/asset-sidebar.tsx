"use client";

import {
	Circle,
	DoorOpen,
	Grid3X3,
	Layout,
	Minus,
	MousePointer2,
	Square,
	Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssetSidebarProps {
	onAddObject: (type: string) => void;
}

export function AssetSidebar({ onAddObject }: AssetSidebarProps) {
	const categories = [
		{
			name: "Tables",
			items: [
				{ type: "table_round", label: "Round Table", icon: Circle },
				{ type: "table_rect", label: "Rect Table", icon: Square },
			],
		},
		{
			name: "Furniture",
			items: [{ type: "stage", label: "Stage", icon: Layout }],
		},
		{
			name: "Venue",
			items: [
				{ type: "wall", label: "Wall", icon: Minus },
				{ type: "wall_diagonal", label: "Diag Wall", icon: Minus, rotate: 45 },
				{ type: "door", label: "Door", icon: DoorOpen },
			],
		},
		{
			name: "Drawing",
			items: [
				{ type: "floor", label: "Floor Area", icon: Grid3X3 },
				{
					type: "floor_diagonal",
					label: "Diag Floor",
					icon: Grid3X3,
					rotate: 45,
				},
			],
		},
	];

	return (
		<div className="flex h-full flex-col bg-white dark:bg-slate-900">
			<div className="space-y-8 p-4">
				{categories.map((category) => (
					<div key={category.name} className="space-y-3">
						<h3 className="px-1 font-black text-slate-400 text-xs uppercase tracking-widest dark:text-slate-500">
							{category.name}
						</h3>
						<div className="grid grid-cols-3 gap-2">
							{category.items.map((item) => (
								<button
									key={item.type}
									className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-transparent p-2 transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-95 dark:hover:border-slate-800 dark:hover:bg-slate-800/50"
									onClick={() => onAddObject(item.type)}
								>
									<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-white group-hover:shadow-sm dark:bg-slate-800 dark:group-hover:bg-slate-700">
										<item.icon
											className="h-6 w-6 text-slate-600 dark:text-slate-400"
											style={
												item.rotate
													? { transform: `rotate(${item.rotate}deg)` }
													: undefined
											}
										/>
									</div>
									<span className="text-center font-bold text-[10px] text-slate-500 leading-tight dark:text-slate-400">
										{item.label}
									</span>
								</button>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
