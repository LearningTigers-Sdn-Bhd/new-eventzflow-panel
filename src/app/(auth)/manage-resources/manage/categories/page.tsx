"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { CategoriesTable } from "@/components/pages/resources/manage/categories/categories-table";
import { CreateCategoriesButton } from "@/components/pages/resources/manage/categories/page-action/create-categories-button";
import { Button } from "@/components/ui/button";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { getResourceCategories } from "@/lib/api/resource/category";

type CategoryFilter = "active" | "archived" | "all";

export default function CategoriesPage() {
	const [filter, setFilter] = useState<CategoryFilter>("active");
	const actions = useMemo(() => <CreateCategoriesButton />, []);
	useSetResourceActions(actions);

	const {
		data: categoriesData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["resource-categories", filter],
		queryFn: () => getResourceCategories({ filter }),
	});

	const categories = categoriesData?.data;

	if (isLoading) {
		return (
			<LoadingState
				title="Loading categories..."
				description="Please wait while we fetch resource categories..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load categories"
				description={
					error.message ||
					"We couldn't load resource categories. Please try again."
				}
				action={<Button onClick={() => refetch()}>Retry</Button>}
			/>
		);
	}

	return (
		<CategoriesTable
			data={categories || []}
			filter={filter}
			onFilterChange={setFilter}
		/>
	);
}
