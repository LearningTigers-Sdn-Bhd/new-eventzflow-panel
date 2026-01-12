"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getPublicResources } from "@/lib/api/resource/endpoints";
import { getResourceTopics } from "@/lib/api/resource/topic/endpoints";
import { getResourceCategories } from "@/lib/api/resource/category/endpoints";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type/endpoints";

import { ResourcesListControl } from "./resources-list-control";
import { resourceColumns } from "./resources-list-column";
import { Button } from "@/components/ui/button";

export default function ResourcesList() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const slug = (params.slug as string) || "all";
    
    // Parse comma-separated slugs from URL
	const categorySlugParam = searchParams.get("category") || "";
    const categorySlugs = useMemo(() => categorySlugParam ? categorySlugParam.split(",") : [], [categorySlugParam]);

	const mediaTypeSlugParam = searchParams.get("mediaType") || "";
    const mediaTypeSlugs = useMemo(() => mediaTypeSlugParam ? mediaTypeSlugParam.split(",") : [], [mediaTypeSlugParam]);

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Fetch filters
	const { data: topicsData } = useQuery({
		queryKey: ["resource-topics"],
		queryFn: () => getResourceTopics({ filter: "active" }),
	});

	const { data: categoriesData } = useQuery({
		queryKey: ["resource-categories"],
		queryFn: () => getResourceCategories({ filter: "active" }),
	});

	const { data: mediaTypesData } = useQuery({
		queryKey: ["resource-media-types"],
		queryFn: () => getResourceMediaTypes({ filter: "active" }),
	});

	// Infinite Query for Resources
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ["public-resources", slug, categorySlugParam, mediaTypeSlugParam],
		queryFn: ({ pageParam = 1 }) =>
			getPublicResources({
				topicSlug: slug,
				categorySlug: categorySlugParam, // Pass comma-separated string directly
				mediaTypeSlug: mediaTypeSlugParam,
				page: pageParam,
				perPage: 12,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.data || lastPage.data.length < 12) return undefined;
            if (lastPage.pagination?.next) return lastPage.pagination.next;
            if (lastPage.data.length === 12) return allPages.length + 1;
			return undefined;
		},
	});

	// Flatten data for the table
	const flatData = useMemo(
		() => data?.pages.flatMap((page) => page.data) || [],
		[data],
	);

	// Table definition
	const table = useReactTable({
		data: flatData,
		columns: resourceColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	// Handlers
	const handleTopicChange = (newSlug: string) => {
		const query = new URLSearchParams(searchParams.toString());
		if (newSlug === "all") {
            router.push(`/resources/topics/all?${query.toString()}`);
        } else {
            router.push(`/resources/topics/${newSlug}?${query.toString()}`);
        }
	};

	const handleCategoryChange = (slugs: string[]) => {
		const query = new URLSearchParams(searchParams.toString());
		if (slugs.length > 0) {
			query.set("category", slugs.join(","));
		} else {
			query.delete("category");
		}
        const currentPath = window.location.pathname;
		router.push(`${currentPath}?${query.toString()}`);
	};

	const handleMediaTypeChange = (slugs: string[]) => {
		const query = new URLSearchParams(searchParams.toString());
		if (slugs.length > 0) {
			query.set("mediaType", slugs.join(","));
		} else {
			query.delete("mediaType");
		}
        const currentPath = window.location.pathname;
		router.push(`${currentPath}?${query.toString()}`);
	};

	return (
		<div className="space-y-8">
			<ResourcesListControl
				topics={topicsData?.data || []}
				categories={categoriesData?.data || []}
				mediaTypes={mediaTypesData?.data || []}
				selectedTopicSlug={slug}
				selectedCategorySlugs={categorySlugs}
				selectedMediaTypeSlugs={mediaTypeSlugs}
				viewMode={viewMode}
				onTopicChange={handleTopicChange}
				onCategoryChange={handleCategoryChange}
				onMediaTypeChange={handleMediaTypeChange}
				onViewModeChange={setViewMode}
			/>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
				</div>
			) : isError ? (
				<div className="text-center text-red-500">Failed to load resources.</div>
			) : flatData.length === 0 ? (
				<div className="text-center text-gray-500 py-20">
                    <p className="text-lg font-medium">No resources found.</p>
                    <p>Try adjusting your filters.</p>
                </div>
			) : (
				<div
					className={
						viewMode === "grid"
							? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
							: "flex flex-col gap-6"
					}
				>
					{table.getRowModel().rows.map((row) => {
                        const cell = row.getVisibleCells().find(c => c.column.id === "title"); 
                        return (
                            <div key={row.id} className="h-full">
                                {cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null}
                            </div>
                        )
					})}
				</div>
			)}

			{/* Load More / End */}
			<div className="flex justify-center py-8">
				{hasNextPage ? (
					<Button
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						variant="outline"
                        size="lg"
                        className="min-w-[200px]"
					>
						{isFetchingNextPage ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</>
						) : (
							"Load More"
						)}
					</Button>
				) : (
					!isLoading && flatData.length > 0 && (
						<p className="text-gray-400 font-medium text-sm">Contents End Here</p>
					)
				)}
			</div>
		</div>
	);
}