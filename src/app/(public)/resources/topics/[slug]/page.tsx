import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import ResourcesList from "@/components/pages/resources/public/topics/resources-list";
import { ResourcesListHero } from "@/components/pages/resources/public/topics/resources-list-hero";
import { getResourceCategories } from "@/lib/api/resource/category/endpoints";
import { getPublicResources } from "@/lib/api/resource/endpoints";
import { getResourceMediaTypes } from "@/lib/api/resource/media-type/endpoints";
import { getResourceTopics } from "@/lib/api/resource/topic/endpoints";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = {
	title: "Resource Topics - EventzFlow",
	description: "Browse resources by topic, category, and media type.",
};

interface PageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface ResourcesListStreamProps {
	slug: string;
	categorySlugParam: string;
	mediaTypeSlugParam: string;
	searchParam: string;
}

async function ResourcesListStream({
	slug,
	categorySlugParam,
	mediaTypeSlugParam,
	searchParam,
}: ResourcesListStreamProps) {
	const queryClient = getQueryClient();

	// Prefetch filters and list in parallel
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ["resource-topics"],
			queryFn: () => getResourceTopics({ filter: "active" }),
		}),
		queryClient.prefetchQuery({
			queryKey: ["resource-categories"],
			queryFn: () => getResourceCategories({ filter: "active" }),
		}),
		queryClient.prefetchQuery({
			queryKey: ["resource-media-types"],
			queryFn: () => getResourceMediaTypes({ filter: "active" }),
		}),
		queryClient.prefetchInfiniteQuery({
			queryKey: [
				"public-resources",
				slug,
				categorySlugParam,
				mediaTypeSlugParam,
				searchParam,
			],
			queryFn: ({ pageParam }) =>
				getPublicResources({
					topicSlug: slug,
					categorySlug: categorySlugParam,
					mediaTypeSlug: mediaTypeSlugParam,
					search: searchParam,
					page: pageParam as number,
					perPage: 12,
				}),
			initialPageParam: 1,
		}),
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ResourcesList />
		</HydrationBoundary>
	);
}

export default async function ResourceTopicsPage({
	params,
	searchParams,
}: PageProps) {
	const resolvedParams = await params;
	const resolvedSearchParams = await searchParams;

	const slug = resolvedParams.slug || "all";
	const categorySlugParam = (resolvedSearchParams.category as string) || "";
	const mediaTypeSlugParam = (resolvedSearchParams.mediaType as string) || "";
	const searchParam = (resolvedSearchParams.search as string) || "";

	return (
		<main className="min-h-screen bg-gray-50/50">
			{/* Hero loads immediately */}
			<ResourcesListHero />

			<div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
				{/* List streams in */}
				<Suspense
					fallback={
						<div className="flex h-40 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
						</div>
					}
				>
					<ResourcesListStream
						slug={slug}
						categorySlugParam={categorySlugParam}
						mediaTypeSlugParam={mediaTypeSlugParam}
						searchParam={searchParam}
					/>
				</Suspense>
			</div>
		</main>
	);
}