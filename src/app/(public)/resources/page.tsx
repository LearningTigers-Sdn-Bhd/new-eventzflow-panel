import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import BranchCTASection from "@/components/pages/resources/public/featured/branch-cta-section";
import { FeaturedSection } from "@/components/pages/resources/public/featured/featured-section";
import { LatestSection } from "@/components/pages/resources/public/featured/latest-section";
import { ResourcesEmptyState } from "@/components/pages/resources/public/featured/resources-empty-state";
import { ResourcesHero } from "@/components/pages/resources/public/featured/resources-hero";
import ToCategoriesSection from "@/components/pages/resources/public/featured/to-categories-section";
import ToTopicsSection from "@/components/pages/resources/public/featured/to-topics-section";
import {
	FeaturedGridSkeleton,
	FeaturedSkeleton,
} from "@/components/pages/resources/public/resource-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getPublicResources,
	getResourceCategories,
	getResourceTopics,
} from "@/lib/api/resource";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = {
	title: "Resources - EventzFlow",
	description:
		"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
	openGraph: {
		title: "Resources - EventzFlow",
		description:
			"Insights, updates, and guides from EventzFlow. Learn about event management best practices and platform updates.",
		url: "https://eventzflow.com/resources",
		siteName: "EventzFlow",
		locale: "en_US",
		type: "website",
	},
};

// Wrapper for Topics Section to handle streaming
async function TopicsSectionStream() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({
		queryKey: ["resource-topics", { filter: "active" }],
		queryFn: () => getResourceTopics({ filter: "active" }),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ToTopicsSection />
		</HydrationBoundary>
	);
}

// Wrapper for Categories Section to handle streaming
async function CategoriesSectionStream() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({
		queryKey: [
			"resource-categories",
			{ filter: "active", sort: "most_published_resources", perPage: 5 },
		],
		queryFn: () =>
			getResourceCategories({
				filter: "active",
				sort: "most_published_resources",
				perPage: 5,
			}),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ToCategoriesSection />
		</HydrationBoundary>
	);
}

// url "/resources"
// A page that displays a list of featured resources.

function FeaturedContentSkeleton() {
	return (
		<div className="bg-white px-6 py-16 md:py-24">
			<div className="mx-auto max-w-7xl space-y-20">
				<FeaturedSkeleton />
				<FeaturedGridSkeleton />
			</div>
		</div>
	);
}

// Wrapper for Main Content to handle streaming and empty state
async function MainContentStream() {
	const queryClient = getQueryClient();

	// Fetch essential resources
	const [featured, standard] = await Promise.all([
		queryClient.fetchQuery({
			queryKey: ["public-resources", { priority: 1 }],
			queryFn: () => getPublicResources({ priority: 1, perPage: 3 }),
		}),
		queryClient.fetchQuery({
			queryKey: ["public-resources", { priorityMin: 2, priorityMax: 5 }],
			queryFn: () =>
				getPublicResources({ priorityMin: 2, priorityMax: 5, perPage: 6 }),
		}),
	]);

	const isEmpty =
		(featured?.data?.length ?? 0) === 0 && (standard?.data?.length ?? 0) === 0;

	if (isEmpty) {
		return <ResourcesEmptyState />;
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<FeaturedSection />
			<LatestSection />
		</HydrationBoundary>
	);
}

export default async function ResourcesPage() {
	return (
		<main>
			<ResourcesHero />

			<Suspense fallback={<FeaturedContentSkeleton />}>
				<MainContentStream />
			</Suspense>

			<Suspense
				fallback={
					<section className="bg-black px-6 py-20 md:py-28">
						<div className="mx-auto max-w-7xl">
							<Skeleton className="h-[400px] w-full bg-white/5" />
						</div>
					</section>
				}
			>
				<TopicsSectionStream />
			</Suspense>

			<Suspense
				fallback={
					<section className="bg-white px-6 py-16 md:px-12 md:py-30">
						<div className="mx-auto max-w-7xl">
							<Skeleton className="h-[500px] w-full bg-black/5" />
						</div>
					</section>
				}
			>
				<CategoriesSectionStream />
			</Suspense>

			<BranchCTASection />
		</main>
	);
}
