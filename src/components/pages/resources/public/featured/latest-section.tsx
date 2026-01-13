"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FeaturedGridCard } from "@/components/pages/resources/public/featured/featured-grid-card";
import { getPublicResources } from "@/lib/api/resource";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export function LatestSection() {
	const { data: standardData } = useSuspenseQuery({
		queryKey: ["public-resources", { priorityMin: 2, priorityMax: 5 }],
		queryFn: () =>
			getPublicResources({ priorityMin: 2, priorityMax: 5, perPage: 6 }),
	});

	const standardResources = standardData?.data || [];

	if (standardResources.length === 0) return null;

	return (
		<section className="bg-white px-6 py-16 md:py-24">
			<div className="mx-auto max-w-7xl">
				{/* Divider */}
				<div className="mb-16 flex flex-row items-center justify-center gap-4 md:mb-24">
					<div className="h-[2px] w-full bg-black/20" />
					<span className="font-bold font-mono text-black/40 text-sm uppercase tracking-widest">
						Latest
					</span>
					<div className="h-[2px] w-full bg-black/20" />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: 0.1 }}
				>
					<FeaturedGridCard resources={standardResources} />
				</motion.div>
			</div>
		</section>
	);
}
