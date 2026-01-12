import type { Metadata } from "next";
import ResourcesList from "@/components/pages/resources/public/topics/resources-list";

export const metadata: Metadata = {
	title: "Resource Topics - EventzFlow",
	description: "Browse resources by topic, category, and media type.",
};

interface PageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResourceTopicsPage({
	params,
	searchParams,
}: PageProps) {
	// We can prefetch here if needed, but for now we rely on the client component's useInfiniteQuery
	// which is standard for infinite scroll/load more patterns in Next.js/React Query unless using hydration.
	// Given the prompt's focus on "use tanstack query", client-side fetching is acceptable.

	return (
		<main className="min-h-screen bg-gray-50/50">
			<div className="container mx-auto max-w-7xl px-4 py-12 md:py-20">
				<div className="mb-12 text-center">
					<h1 className="font-black text-4xl text-gray-900 uppercase tracking-tighter sm:text-5xl md:text-6xl">
						Explore Resources
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-gray-500 text-lg">
						Discover insights, guides, and latest updates curated for your
						success.
					</p>
				</div>

				<ResourcesList />
			</div>
		</main>
	);
}
