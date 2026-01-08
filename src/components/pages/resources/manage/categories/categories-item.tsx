"use client";

import { FileText, Tag } from "lucide-react";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import { CategoriesActionMenu } from "./categories-action-menu";

interface CategoriesItemProps {
	category: ResourceCategory;
}

export function CategoriesItem({ category }: CategoriesItemProps) {
	return (
		<Item variant="outline" className="rounded-none">
			<ItemHeader>
				<ItemTitle className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center border bg-muted">
						<Tag className="h-4 w-4 text-muted-foreground" />
					</div>
					<span className="font-medium">{category.name}</span>
				</ItemTitle>
			</ItemHeader>
			{category.description && (
				<ItemContent>
					<div className="flex items-start gap-2 text-muted-foreground text-sm">
						<FileText className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="line-clamp-2">{category.description}</p>
					</div>
				</ItemContent>
			)}
			<ItemFooter className="flex items-center justify-between text-muted-foreground text-xs">
				<span>
					Created: {new Date(category.createdAt).toLocaleDateString()}
				</span>
				<ItemActions>
					<CategoriesActionMenu category={category} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}