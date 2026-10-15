"use client";

import { Circle, DoorOpen, Grid3X3, Layout, Minus, Square } from "lucide-react";

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
			<div className="space-y-6 p-4">
				{categories.map((category) => (
					<div key={category.name} className="space-y-2">
						<h3 className="px-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
							{category.name}
						</h3>
						<div className="grid grid-cols-3 gap-2">
							{category.items.map((item) => (
								<button
									key={item.type}
									type="button"
									className="flex flex-col items-center justify-center gap-2 rounded-none border border-dashed p-2 transition-colors hover:border-primary hover:bg-primary/5"
									onClick={() => onAddObject(item.type)}
								>
									<div className="flex h-11 w-11 items-center justify-center rounded-none border border-primary/20 bg-primary/5">
										<item.icon
											className="h-5 w-5 text-primary"
											style={
												item.rotate
													? { transform: `rotate(${item.rotate}deg)` }
													: undefined
											}
										/>
									</div>
									<span className="text-center font-medium text-[10px] text-muted-foreground leading-tight">
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
