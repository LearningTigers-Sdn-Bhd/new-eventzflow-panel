"use client";

import {
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
	useResponsive,
} from "@/components/admin-ui/layout/responsive-layout";
import { Button } from "@/components/ui/button";
import { getResourceCategories } from "@/lib/api/resource/category/endpoints";
import { getPublicResources } from "@/lib/api/resource/endpoints";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type/endpoints";
import { getResourceTopics } from "@/lib/api/resource/topic/endpoints";
import { cn } from "@/lib/utils";
import { ResourcesCard } from "../resources-card";
import {
	ResourcesCloseFilterButton,
	ResourcesFilterButton,
	ResourcesFilterSelect,
	ResourcesSearchInput,
	ResourcesTopicButton,
} from "./resources-list-components";
import { ResourcesListControl } from "./resources-list-control";

export default function ResourcesList() {
	return (
		<ResponsiveLayout>
			<ResourcesListInner />
		</ResponsiveLayout>
	);
}

function ResourcesListInner() {
	const router = useRouter();
	const params = useParams();
	const { breakpoint } = useResponsive();
	const listRef = useRef<HTMLDivElement>(null);
	const [isPending, startTransition] = useTransition();
	const _isPending = isPending;
	const slug = (params.slug as string) || "all";

	// Nuqs state management for query params
	const [categorySlugs, setCategorySlugs] = useQueryState(
		"category",
		parseAsArrayOf(parseAsString)
			.withDefault([])
			.withOptions({ shallow: false }),
	);

	const [mediaTypeSlugs, setMediaTypeSlugs] = useQueryState(
		"mediaType",
		parseAsArrayOf(parseAsString)
			.withDefault([])
			.withOptions({ shallow: false }),
	);

	const [search, setSearch] = useQueryState(
		"search",
		parseAsString.withDefault("").withOptions({ shallow: false }),
	);

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

	// Fetch filters
	const { data: topicsData } = useSuspenseQuery({
		queryKey: ["resource-topics"],
		queryFn: () => getResourceTopics({ filter: "active" }),
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	const { data: categoriesData } = useSuspenseQuery({
		queryKey: ["resource-categories"],
		queryFn: () => getResourceCategories({ filter: "active" }),
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	const { data: mediaTypesData } = useSuspenseQuery({
		queryKey: ["resource-media-types"],
		queryFn: () => getResourceMediaTypes({ filter: "active" }),
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	// Prepare filter params for API
	const categorySlugParam = categorySlugs.join(",");
	const mediaTypeSlugParam = mediaTypeSlugs.join(",");

	// Infinite Query for Resources
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useSuspenseInfiniteQuery({
			queryKey: [
				"public-resources",
				slug,
				categorySlugParam,
				mediaTypeSlugParam,
				search,
			],
			queryFn: ({ pageParam = 1 }) =>
				getPublicResources({
					topicSlug: slug,
					categorySlug: categorySlugParam,
					mediaTypeSlug: mediaTypeSlugParam,
					search: search,
					page: pageParam as number,
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

	// Flatten data
	const flatData = useMemo(
		() => data.pages.flatMap((page) => page.data) || [],
		[data],
	);

	// Handlers
	const handleTopicChange = useCallback(
		(newSlug: string) => {
			const currentQuery = new URLSearchParams(window.location.search);
			startTransition(() => {
				if (newSlug === "all") {
					router.push(`/resources/topics/all?${currentQuery.toString()}`);
				} else {
					router.push(
						`/resources/topics/${newSlug}?${currentQuery.toString()}`,
					);
				}
			});
		},
		[router],
	);

	// Handlers for mobile actions
	const handleClearFilters = useCallback(() => {
		startTransition(() => {
			setCategorySlugs(null);
			setMediaTypeSlugs(null);
			setSearch("");
		});
	}, [setCategorySlugs, setMediaTypeSlugs, setSearch]);

	const topics = topicsData.data || [];
	const categories = categoriesData.data || [];
	const mediaTypes = mediaTypesData.data || [];

	// Determine layout based on responsive view
	// Mobile/Tablet forces list view
	const currentViewMode =
		breakpoint === "mobile" || breakpoint === "tablet" ? "list" : viewMode;

	// Virtualization logic
	const columns = currentViewMode === "grid" ? 3 : 1;
	const rowCount = Math.ceil(flatData.length / columns);

	const virtualizer = useWindowVirtualizer({
		count: rowCount,
		estimateSize: () => (currentViewMode === "grid" ? 450 : 250), // Estimate heights
		overscan: 5,
		scrollMargin: listRef.current?.offsetTop ?? 0,
	});

	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div className="space-y-8">
			{/* Desktop View: Standard Control */}
			<DesktopView>
				<ResourcesListControl
					topics={topics}
					categories={categories}
					mediaTypes={mediaTypes}
					selectedTopicSlug={slug}
					selectedCategorySlugs={categorySlugs}
					selectedMediaTypeSlugs={mediaTypeSlugs}
					searchQuery={search}
					viewMode={viewMode}
					onTopicChange={handleTopicChange}
					onCategoryChange={(slugs) =>
						setCategorySlugs(slugs.length > 0 ? slugs : null)
					}
					onMediaTypeChange={(slugs) =>
						setMediaTypeSlugs(slugs.length > 0 ? slugs : null)
					}
					onSearchChange={setSearch}
					onViewModeChange={setViewMode}
					onClearFilters={handleClearFilters}
				/>
			</DesktopView>

			{/* Mobile/Tablet View: Custom Layout */}
			<MobileTabletView>
				<div className="space-y-4">
					{/* Swipeable Topics - Always visible */}
					<div className="scrollbar-hide -mx-4 mb-2 flex w-[calc(100%+2rem)] overflow-x-auto px-4 pb-2">
						<div className="flex min-w-max gap-2">
							<ResourcesTopicButton
								label="All Topics"
								isSelected={slug === "all"}
								onClick={() => handleTopicChange("all")}
							/>
							{topics.map((topic) => (
								<ResourcesTopicButton
									key={topic.id}
									label={topic.name}
									isSelected={slug === topic.slug}
									onClick={() => handleTopicChange(topic.slug)}
								/>
							))}
						</div>
					</div>

					{!isMobileFilterOpen ? (
						<div className="flex flex-col gap-4">
							{/* Filter Button */}
							<ResourcesFilterButton
								onClick={() => setIsMobileFilterOpen(true)}
								label="Filter Resources"
							/>
						</div>
					) : (
						<div className="fade-in slide-in-from-top-2 flex animate-in flex-col gap-4 duration-200">
							{/* Search */}
							<ResourcesSearchInput
								value={search}
								onChange={setSearch}
								placeholder="Search resources..."
							/>

							{/* Filters Row */}
							<div className="flex gap-2">
								<ResourcesFilterSelect
									value={categorySlugs}
									onChange={(slugs) =>
										setCategorySlugs(slugs.length > 0 ? slugs : null)
									}
									placeholder="Category"
									options={categories.map((c) => ({
										label: c.name,
										value: c.slug,
									}))}
								/>
								<ResourcesFilterSelect
									value={mediaTypeSlugs}
									onChange={(slugs) =>
										setMediaTypeSlugs(slugs.length > 0 ? slugs : null)
									}
									placeholder="Media Type"
									options={mediaTypes.map((t) => ({
										label: t.name,
										value: t.slug,
									}))}
								/>
							</div>

							{/* Actions Row */}
							<div className="grid grid-cols-2 gap-2">
								<Button
									onClick={handleClearFilters}
									className="h-10 cursor-pointer rounded-none border border-black bg-red-600 font-medium text-white shadow-none transition-all hover:bg-red-700"
								>
									Clear All
								</Button>
								<ResourcesCloseFilterButton
									onClick={() => setIsMobileFilterOpen(false)}
								/>
							</div>
						</div>
					)}
				</div>
			</MobileTabletView>

			{/* Resource List with Virtualization */}
			{flatData.length === 0 ? (
				<div className="py-20 text-center text-gray-500">
					<p className="font-medium text-lg">No resources found.</p>
					<p>Try adjusting your filters.</p>
				</div>
			) : (
				<div
					ref={listRef}
					className="relative w-full"
					style={{
						height: `${virtualizer.getTotalSize()}px`,
					}}
				>
					{virtualItems.map((virtualRow) => {
						const startIndex = virtualRow.index * columns;
						const rowItems = flatData.slice(startIndex, startIndex + columns);

						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								ref={virtualizer.measureElement}
								className={cn(
									"absolute top-0 left-0 w-full",
									currentViewMode === "grid"
										? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
										: "flex flex-col gap-6",
								)}
								style={{
									transform: `translateY(${
										virtualRow.start - virtualizer.options.scrollMargin
									}px)`,
									paddingBottom: currentViewMode === "grid" ? "24px" : "24px",
								}}
							>
								{rowItems.map((resource) => (
									<div key={resource.id} className="h-full">
										<ResourcesCard
											resource={resource}
											layout={currentViewMode}
										/>
									</div>
								))}
							</div>
						);
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
					flatData.length > 0 && (
						<p className="font-medium text-gray-400 text-sm">
							Contents End Here
						</p>
					)
				)}
			</div>
		</div>
	);
}
