import { memo, useCallback, useMemo } from "react";
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

	// Memoized hover class generator to avoid recreating on every render
	const getHoverClass = useCallback(
		(index: number) => {
			if (total === 1) {
				return "lg:hover:-translate-y-4";
			}

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
				// 2-column logic (2, 4 items)
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
		},
		[total, isFiveItems, isSmallGrid],
	);

	// Memoize grid class calculation
	const gridClass = useMemo(
		() =>
			cn(
				"grid gap-0 bg-black/30",
				isFiveItems
					? "grid-cols-1 md:grid-cols-2 lg:grid-cols-6"
					: isSmallGrid
						? "grid-cols-1 md:grid-cols-2"
						: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
			),
		[isFiveItems, isSmallGrid],
	);

	return (
		<div className={gridClass}>
			{resources.map((resource, index) => {
				// Special span logic:
				// 1 item: col-span-2
				// 5 items: First 2 col-span-3, next 3 col-span-2
				const spanClass =
					total === 1
						? "md:col-span-2"
						: isFiveItems
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
							"transition-all duration-550",
							"border-0 border-black hover:border-2 hover:border-white lg:hover:z-30 lg:hover:shadow-2xl",
							spanClass,
							getHoverClass(index),
						)}
					/>
				);
			})}
		</div>
	);
});
