"use client";

import { Calendar, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { ItemCategory } from "@/lib/api/item-category";
import { CategoryActionsMenu } from "./action-menu";

interface ItemCategoryItemProps {
	category: ItemCategory;
}

export function ItemCategoryItem({ category }: ItemCategoryItemProps) {
	const date = new Date(category.createdAt);

	return (
		<Item variant="outline" className="h-full w-full rounded-none">
			<ItemHeader className="flex flex-col gap-2">
				<ItemTitle className="flex min-h-12 w-full flex-col items-start justify-start">
					<div className="flex items-center gap-2">
						<FolderOpen className="size-5 text-muted-foreground" />
						<h3 className="truncate text-wrap font-bold text-xl">
							{category.name}
						</h3>
					</div>
					<Badge
						variant={category.active ? "default" : "secondary"}
						className={cn(
							"w-fit rounded-none capitalize hover:bg-green-100",
							category.active
								? "bg-green-100 text-green-800"
								: "bg-gray-100 text-gray-800 hover:bg-gray-100",
						)}
					>
						{category.active ? "Active" : "Inactive"}
					</Badge>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="flex flex-col gap-2">
				<div className="grid grid-cols-1 gap-2">
					<div className="flex items-center justify-start gap-2">
						<Calendar className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							Created: {date.toLocaleDateString()}
						</span>
					</div>
					<div className="flex items-center justify-start gap-2">
						<Calendar className="size-4 text-muted-foreground" />
						<span className="truncate font-medium text-sm">
							{date.toLocaleTimeString()}
						</span>
					</div>
				</div>
			</ItemContent>
			<ItemFooter className="flex w-full justify-end">
				<ItemActions>
					<CategoryActionsMenu category={category} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
