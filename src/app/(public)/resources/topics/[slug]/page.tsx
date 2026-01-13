import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import BranchCTASection from "@/components/pages/resources/public/featured/branch-cta-section";
import ResourcesList from "@/components/pages/resources/public/topics/resources-list";
import { getResourceCategories } from "@/lib/api/resource/category/endpoints";
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

async function ResourcesListStream() {
	const queryClient = getQueryClient();

	// Prefetch filters only - fast and necessary for controls
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
	await params;
	await searchParams;

	return (
		<section className="min-h-screen bg-white">
			<div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
				{/* List streams in */}
				<ResourcesListStream />
			</div>
			<BranchCTASection />
		</section>
	);
}
