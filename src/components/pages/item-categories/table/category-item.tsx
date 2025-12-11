"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormatDate } from "@/hooks/use-format-date";
import type { ItemCategory } from "@/lib/api/item-category";
import { CategoryActionsMenu } from "./action-menu";

interface CategoryItemProps {
	category: ItemCategory;
}

export function CategoryItem({ category }: CategoryItemProps) {
	const { formatDate } = useFormatDate();

	return (
		<Card className="rounded-none border-primary/20 shadow-none">
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<h3 className="font-semibold">{category.name}</h3>
							<Badge
								variant={category.active ? "default" : "secondary"}
								className="rounded-none capitalize"
							>
								{category.active ? "Active" : "Inactive"}
							</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							Created: {formatDate(category.createdAt)}
						</p>
					</div>
					<CategoryActionsMenu category={category} />
				</div>
			</CardContent>
		</Card>
	);
}
