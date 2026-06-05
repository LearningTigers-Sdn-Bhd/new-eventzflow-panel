"use client";

import {
	keepPreviousData,
	useInfiniteQuery,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import type { Route } from "next";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
import {
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
import { ResourcesListControl } from "./resources-list-control";
import { ResourcesListEmpty } from "./resources-list-empty";
import { ResourcesListEnd } from "./resources-list-end";
import { ResourcesListLoading } from "./resources-list-loading";

export default function ResourcesList() {
	return (
		<ResponsiveLayout>
			<ResourcesListInner />
		</ResponsiveLayout>
	);
}

function ResourcesListInner() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const [isAnimating, setIsAnimating] = useState(false);

	const slug = (params.slug as string) || "all";

	// Helper to ensure animation plays even for cached data
	const triggerAnimation = useCallback((cb: () => void) => {
		setIsAnimating(true);
		cb();
		// Keep animating for at least 600ms to allow the slide up and start of return
		setTimeout(() => {
			setIsAnimating(false);
		}, 600);
	}, []);

	// -- State management using standard useSearchParams --

	// Parse current state from URL
	const categorySlugs = useMemo(() => {
		const param = searchParams.get("category");
		return param ? param.split(",") : [];
	}, [searchParams]);

	const mediaTypeSlugs = useMemo(() => {
		const param = searchParams.get("mediaType");
		return param ? param.split(",") : [];
	}, [searchParams]);

	const search = searchParams.get("search") || "";

	// -- Local UI State --
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// Fetch filters options
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

	const topics = topicsData.data || [];
	const categories = categoriesData.data || [];
	const mediaTypes = mediaTypesData.data || [];

	// Helper to update URL params
	const updateUrl = useCallback(
		(newParams: URLSearchParams) => {
			triggerAnimation(() => {
				startTransition(() => {
					router.push(`${pathname}?${newParams.toString()}` as Route, {
						scroll: false,
					});
				});
			});
		},
		[pathname, router, triggerAnimation],
	);

	// Handlers
	const handleTopicChange = useCallback(
		(newSlug: string) => {
			const currentQuery = new URLSearchParams(searchParams.toString());
			triggerAnimation(() => {
				startTransition(() => {
					if (newSlug === "all") {
						router.push(
							`/resources/topics/all?${currentQuery.toString()}` as Route,
							{ scroll: false },
						);
					} else {
						router.push(
							`/resources/topics/${newSlug}?${currentQuery.toString()}` as Route,
							{ scroll: false },
						);
					}
				});
			});
		},
		[router, searchParams, triggerAnimation],
	);

	const handleCategoryChange = useCallback(
		(slugs: string[]) => {
			const current = new URLSearchParams(searchParams.toString());
			if (slugs.length > 0) {
				current.set("category", slugs.join(","));
			} else {
				current.delete("category");
			}
			updateUrl(current);
		},
		[searchParams, updateUrl],
	);

	const handleMediaTypeChange = useCallback(
		(slugs: string[]) => {
			const current = new URLSearchParams(searchParams.toString());
			if (slugs.length > 0) {
				current.set("mediaType", slugs.join(","));
			} else {
				current.delete("mediaType");
			}
			updateUrl(current);
		},
		[searchParams, updateUrl],
	);

	const handleSearchChange = useCallback(
		(query: string) => {
			const current = new URLSearchParams(searchParams.toString());
			if (query) {
				current.set("search", query);
			} else {
				current.delete("search");
			}
			updateUrl(current);
		},
		[searchParams, updateUrl],
	);

	const handleClearFilters = useCallback(() => {
		const current = new URLSearchParams(searchParams.toString());
		current.delete("category");
		current.delete("mediaType");
		current.delete("search");
		updateUrl(current);
	}, [searchParams, updateUrl]);

	// Prepare props for the grid
	const gridProps = {
		slug,
		categorySlugs,
		mediaTypeSlugs,
		search,
		viewMode,
		isPending: isPending || isAnimating, // Combine both
	};

	return (
		<div className="space-y-8">
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
				onCategoryChange={handleCategoryChange}
				onMediaTypeChange={handleMediaTypeChange}
				onSearchChange={handleSearchChange}
				onViewModeChange={setViewMode}
				onClearFilters={handleClearFilters}
			/>

			{/* Data Grid */}
			<ResourcesGrid {...gridProps} />
		</div>
	);
}

// Separate component to handle data fetching and virtualization
const ResourcesGrid = memo(function ResourcesGrid({
	slug,
	categorySlugs,
	mediaTypeSlugs,
	search,
	viewMode,
	isPending,
}: {
	slug: string;
	categorySlugs: string[];
	mediaTypeSlugs: string[];
	search: string;
	viewMode: "grid" | "list";
	isPending: boolean;
}) {
	const { breakpoint } = useResponsive();
	const listRef = useRef<HTMLDivElement>(null);
	// State to store the offsetTop of the list container for accurate virtualization
	const [listOffset, setListOffset] = useState(0);

	// Measure list offset on mount/resize
	useEffect(() => {
		const updateOffset = () => {
			if (listRef.current) {
				setListOffset(listRef.current.offsetTop);
			}
		};

		updateOffset();
		window.addEventListener("resize", updateOffset);
		return () => window.removeEventListener("resize", updateOffset);
	}, []);

	// Prepare filter params for API
	const categorySlugParam = categorySlugs.join(",");
	const mediaTypeSlugParam = mediaTypeSlugs.join(",");

	// Infinite Query for Resources
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery({
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
				if (lastPage.pagination?.next_page)
					return lastPage.pagination.next_page;
				if (lastPage.data.length === 12) return allPages.length + 1;
				return undefined;
			},
			placeholderData: keepPreviousData,
		});

	// Derived data for virtualization
	const flatData = useMemo(
		() => data?.pages.flatMap((page) => page.data || []) || [],
		[data],
	);

	const currentViewMode = useMemo(
		() =>
			breakpoint === "mobile" || breakpoint === "tablet" ? "list" : viewMode,
		[breakpoint, viewMode],
	);

	const columns = currentViewMode === "grid" ? 3 : 1;
	const rowCount = Math.ceil(flatData.length / columns);

	const virtualizer = useWindowVirtualizer({
		count: rowCount,
		estimateSize: () => (currentViewMode === "grid" ? 450 : 250),
		overscan: 5,
		scrollMargin: listOffset,
	});

	const virtualItems = virtualizer.getVirtualItems();

	// Handle initial loading manually since we aren't using Suspense
	if (isLoading) {
		return <ResourcesListLoading />;
	}

	return (
		<div className="relative">
			{flatData.length === 0 ? (
				<ResourcesListEmpty />
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
										? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
										: "flex flex-col gap-6",
								)}
								style={{
									transform: `translateY(${
										virtualRow.start - virtualizer.options.scrollMargin
									}px)`,
									paddingBottom: "24px",
								}}
							>
								{rowItems.map((resource) => (
									<div key={resource.id} className="relative isolate h-full">
										{/* Cloned Div (Shadow) - Stays behind */}
										<div
											className={cn(
												"absolute inset-0 border border-black bg-green-600",
												// Show when pending.
												// Hide with delay when not pending to ensure the top card has returned to cover it.
												isPending
													? "opacity-100"
													: "opacity-0 transition-opacity delay-500 duration-300",
											)}
											style={{
												backgroundImage:
													"repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.2) 2px, rgba(255,255,255,0.2) 4px)",
											}}
										/>

										{/* Moving Card Container */}
										<motion.div
											className="relative h-full bg-background"
											initial={{ opacity: 0, x: -20, y: 20, rotate: -5 }}
											animate={
												isPending
													? { opacity: 1, x: -8, y: -8, rotate: 0 }
													: { opacity: 1, x: 0, y: 0, rotate: 0 }
											}
											transition={{
												duration: 0.4,
												ease: [0.16, 1, 0.3, 1],
											}}
										>
											{/* Content */}
											<ResourcesCard
												resource={resource}
												layout={currentViewMode}
											/>

											{/* Overlay */}
											<motion.div
												className="absolute inset-0 z-50 bg-stone-900"
												initial={{ opacity: 0 }}
												animate={{ opacity: isPending ? 1 : 0 }}
												transition={{
													// Immediate jump to stone-900 when pending, slow fade out when reveal
													opacity: {
														duration: isPending ? 0 : 0.5,
														delay: isPending ? 0 : 0.4,
														ease: "easeInOut",
													},
												}}
												style={{ pointerEvents: isPending ? "all" : "none" }}
											/>
										</motion.div>
									</div>
								))}
							</div>
						);
					})}
				</div>
			)}

			{/* Load More / End */}
			<div className="flex justify-center py-8">
				{isFetchingNextPage ? (
					<ResourcesListLoading className="h-32" />
				) : hasNextPage ? (
					<Button
						onClick={() => fetchNextPage()}
						size="lg"
						className="w-full cursor-pointer rounded-none bg-black py-8 font-bold text-lg text-white uppercase tracking-tighter hover:bg-stone-700"
					>
						Load More
					</Button>
				) : (
					flatData.length > 0 && <ResourcesListEnd />
				)}
			</div>
		</div>
	);
});
