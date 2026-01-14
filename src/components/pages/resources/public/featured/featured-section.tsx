"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { memo } from "react";
import { FeaturedCard } from "@/components/pages/resources/public/featured/featured-card";
import { getFeaturedResources } from "@/lib/api/resource";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export const FeaturedSection = memo(function FeaturedSection() {
	const { data } = useSuspenseQuery({
		queryKey: ["featured-resources"],
		queryFn: () => getFeaturedResources(),
	});

	const featuredResources = data?.featured || [];

	if (featuredResources.length === 0) return null;

	return (
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
							Everything you need to run seamless events, all in one platform.
						</p>
					</div>
					<div className="hidden border-black/40 border-b pb-2 font-bold text-black/40 text-sm tracking-widest md:block">
						01 — 09 / RESOURCES
					</div>
				</div>
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: SMOOTH_EASE, delay: 0.2 }}
				>
					<FeaturedCard resources={featuredResources} />
				</motion.div>
			</div>
		</section>
	);
});
