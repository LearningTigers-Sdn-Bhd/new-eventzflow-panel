import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { FeaturedSection } from "@/components/pages/resources/public/featured/featured-section";
import { LatestSection } from "@/components/pages/resources/public/featured/latest-section";
import { ResourcesEmptyState } from "@/components/pages/resources/public/featured/resources-empty-state";
import { ResourcesHero } from "@/components/pages/resources/public/featured/resources-hero";
import {
	FeaturedGridSkeleton,
	FeaturedSkeleton,
} from "@/components/pages/resources/public/resource-skeleton";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedResources } from "@/lib/api/resource";
import { getQueryClient } from "@/lib/query-client";

// Lazy load below-the-fold components for better initial load performance
const ToTopicsSection = dynamicImport(
	() =>
		import("@/components/pages/resources/public/featured/to-topics-section"),
	{
		loading: () => (
			<section className="bg-black px-6 py-20 md:py-28">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="h-[400px] w-full bg-white/5" />
				</div>
			</section>
		),
	},
);

const ToCategoriesSection = dynamicImport(
	() =>
		import(
			"@/components/pages/resources/public/featured/to-categories-section"
		),
	{
		loading: () => (
			<section className="bg-white px-6 py-16 md:px-12 md:py-30">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="h-[500px] w-full bg-black/5" />
				</div>
			</section>
		),
	},
);

const BranchCTASection = dynamicImport(
	() =>
		import("@/components/pages/resources/public/featured/branch-cta-section"),
	{
		loading: () => (
			<section className="bg-white px-6 py-16">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="h-[300px] w-full bg-black/5" />
				</div>
			</section>
		),
	},
);

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

// Force dynamic rendering since we're fetching from an external API
// that isn't available at build time
export const dynamic = "force-dynamic";

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

	// Fetch featured resources in a single API call to avoid race conditions
	const resources = await queryClient.fetchQuery({
		queryKey: ["featured-resources"],
		queryFn: () => getFeaturedResources(),
	});

	const isEmpty =
		resources.featured.length === 0 && resources.standard.length === 0;

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
			<ScrollToTop />
			<ResourcesHero />

			<Suspense fallback={<FeaturedContentSkeleton />}>
				<MainContentStream />
			</Suspense>

			{/* Lazy loaded below-the-fold sections */}
			<ToTopicsSection />
			<ToCategoriesSection />
			<BranchCTASection />
		</main>
	);
}
