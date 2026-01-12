"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import BranchCTASection from "@/components/pages/resources/public/featured/branch-cta-section";
import { FeaturedCard } from "@/components/pages/resources/public/featured/featured-card";
import { FeaturedGridCard } from "@/components/pages/resources/public/featured/featured-grid-card";
import ToCategoriesSection from "@/components/pages/resources/public/featured/to-categories-section";
import ToTopicsSection from "@/components/pages/resources/public/featured/to-topics-section";
import {
	FeaturedGridSkeleton,
	FeaturedSkeleton,
} from "@/components/pages/resources/public/resource-skeleton";
import { getPublicResources } from "@/lib/api/resource";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function ResourcesPageClient() {
	const { data: featuredData, isLoading: isLoadingFeatured } = useQuery({
		queryKey: ["public-resources", { priority: 1 }],
		queryFn: () => getPublicResources({ priority: 1, perPage: 3 }),
	});

	const { data: standardData, isLoading: isLoadingStandard } = useQuery({
		queryKey: ["public-resources", { priorityMin: 2, priorityMax: 5 }],
		queryFn: () =>
			getPublicResources({ priorityMin: 2, priorityMax: 5, perPage: 6 }),
	});

	const featuredResources = featuredData?.data || [];
	const standardResources = standardData?.data || [];
	const isLoading = isLoadingFeatured || isLoadingStandard;

	return (
		<main>
			{/* Hero Section */}
			<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
				{/* Left vertical accent line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 1.5, ease: SMOOTH_EASE }}
					className="absolute top-0 left-6 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
				/>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="text-center"
				>
					<p className="mb-4 font-medium text-base text-white/60 uppercase tracking-[0.3em]">
						Blogs & Insights
					</p>
					<h1 className="font-black text-4xl text-white uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
						Resources
					</h1>
				</motion.div>
			</section>

			{/* Featured Resources Section (Priority 1) */}
			{(featuredResources.length > 0 || isLoadingFeatured) && (
				<section className="space-y-8 bg-white px-6 py-16 md:py-24">
					<div className="mx-auto max-w-7xl">
						{/* Header */}
						<div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
							<div className="max-w-2xl">
								<h2 className="mb-4 font-black text-4xl text-black uppercase tracking-tighter sm:text-5xl md:mb-6 md:text-6xl lg:text-8xl">
									Featured
									<br />
									Contents
								</h2>
								<p className="text-black/70 text-lg leading-relaxed md:text-xl">
									Everything you need to run seamless events, all in one
									platform.
								</p>
							</div>
							<div className="hidden border-black/40 border-b pb-2 font-bold text-black/40 text-sm tracking-widest md:block">
								01 — 09 / RESOURCES
							</div>
						</div>
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						>
							{isLoadingFeatured ? (
								<FeaturedSkeleton />
							) : (
								<FeaturedCard resources={featuredResources} />
							)}
						</motion.div>
					</div>

					{/* Divider */}
					<div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-center gap-4">
						<div className="h-[2px] w-full bg-black/20" />
						<span className="font-bold font-mono text-black/40 text-sm uppercase tracking-widest">
							Latest
						</span>
						<div className="h-[2px] w-full bg-black/20" />
					</div>

					{/* Latest/Standard Resources Section (Priority 2-5) */}
					{(standardResources.length > 0 || isLoadingStandard) && (
						<div className="mx-auto max-w-7xl">
							<motion.div
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, ease: SMOOTH_EASE }}
							>
								{isLoadingStandard ? (
									<FeaturedGridSkeleton />
								) : (
									<FeaturedGridCard resources={standardResources} />
								)}
							</motion.div>
						</div>
					)}
				</section>
			)}

			<ToTopicsSection />
			<ToCategoriesSection />
			<BranchCTASection />

			{!isLoading &&
				featuredResources.length === 0 &&
				standardResources.length === 0 && (
					<section className="bg-white px-6 py-32 md:py-40">
						<div className="mx-auto max-w-4xl text-center">
							<motion.div
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, ease: SMOOTH_EASE }}
							>
								{/* Decorative line */}
								<div className="mx-auto mb-8 h-[2px] w-16 bg-black/20" />

								<p className="mb-4 font-bold text-black/40 text-xs uppercase tracking-[0.4em]">
									Coming Soon
								</p>
								<h2 className="mb-6 font-black text-3xl text-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
									We're working on it
								</h2>
								<p className="mx-auto max-w-xl text-base text-black/60 leading-relaxed md:text-lg">
									Our team is preparing insightful articles, guides, and case
									studies to help you get the most out of your events. Stay
									tuned.
								</p>

								{/* Decorative line */}
								<div className="mx-auto mt-12 h-[2px] w-16 bg-black/20" />
							</motion.div>
						</div>
					</section>
				)}
		</main>
	);
}
