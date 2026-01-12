import { memo } from "react";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { ResourcesCard } from "../resources-card";

interface FeaturedGridCardProps {
	resources: Resource[];
}

export const FeaturedGridCard = memo(function FeaturedGridCard({
	resources,
}: FeaturedGridCardProps) {
	const total = resources.length;
	const isFiveItems = total === 5;
	const isThreeItems = total === 3;
	// Small grid logic: 1, 2, or 4 items (excluding 3)
	const isSmallGrid = total > 0 && total < 5 && !isThreeItems;

	const getHoverClass = (index: number) => {
		if (isFiveItems) {
			switch (index) {
				case 0: // Top Left (Wide)
					return "lg:hover:-translate-y-4 lg:hover:-translate-x-4";
				case 1: // Top Right (Wide)
					return "lg:hover:-translate-y-4 lg:hover:translate-x-4";
				case 2: // Bottom Left
					return "lg:hover:translate-y-4 lg:hover:-translate-x-4";
				case 3: // Bottom Center
					return "lg:hover:translate-y-4";
				case 4: // Bottom Right
					return "lg:hover:translate-y-4 lg:hover:translate-x-4";
				default:
					return "";
			}
		}

		if (isSmallGrid) {
			// 2-column logic (1, 2, 4 items)
			const isLeft = index % 2 === 0;
			const isTop = index < 2;
			const isBottom = index >= 2;

			let classes = "";
			if (isTop) classes += " lg:hover:-translate-y-4";
			if (isBottom) classes += " lg:hover:translate-y-4";
			if (isLeft) classes += " lg:hover:-translate-x-4";
			else classes += " lg:hover:translate-x-4";

			return classes.trim();
		}

		// 3-column logic (3 items or >=6)
		switch (index) {
			case 0: // Top Left
				return "lg:hover:-translate-y-4 lg:hover:-translate-x-4";
			case 1: // Top Center
				return "lg:hover:-translate-y-4";
			case 2: // Top Right
				return "lg:hover:-translate-y-4 lg:hover:translate-x-4";
			case 3: // Bottom Left
				return "lg:hover:translate-y-4 lg:hover:-translate-x-4";
			case 4: // Bottom Center
				return "lg:hover:translate-y-4";
			case 5: // Bottom Right
				return "lg:hover:translate-y-4 lg:hover:translate-x-4";
			default:
				return "";
		}
	};

	return (
		<div
			className={cn(
				"grid gap-0 bg-primary/50",
				// Mobile/Tablet: 1 -> 2 cols
				// Desktop:
				// - 5 items: 6 cols (special layout)
				// - Small grid (1,2,4): 2 cols
				// - Standard (3, 6+): 3 cols
				isFiveItems
					? "grid-cols-1 md:grid-cols-2 lg:grid-cols-6"
					: isSmallGrid
						? "grid-cols-1 md:grid-cols-2"
						: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
			)}
		>
			{resources.map((resource, index) => {
				// Special span logic for 5 items on desktop:
				// First 2 items: col-span-3 (Top Row)
				// Next 3 items: col-span-2 (Bottom Row)
				const spanClass = isFiveItems
					? index < 2
						? "lg:col-span-3"
						: "lg:col-span-2"
					: "";

				return (
					<ResourcesCard
						key={resource.id}
						resource={resource}
						layout="grid"
						className={cn(
							"transition-all duration-500",
							"lg:hover:z-30 lg:hover:shadow-2xl",
							spanClass,
							getHoverClass(index),
						)}
					/>
				);
			})}
		</div>
	);
});
