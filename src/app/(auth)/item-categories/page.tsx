"use client";

import { useQuery } from "@tanstack/react-query";
import CategoryClientWrapper from "@/components/pages/item-categories/category-client-wrapper";
import { getItemCategories } from "@/lib/api/item-category";

export default function ItemCategoriesPage() {
	const {
		data: categories,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["item-categories"],
		queryFn: getItemCategories,
	});

	return (
		<div className="space-y-6 p-0">
			<CategoryClientWrapper
				categories={categories ?? []}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
