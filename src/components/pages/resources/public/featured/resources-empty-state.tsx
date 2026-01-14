"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export const ResourcesEmptyState = memo(function ResourcesEmptyState() {
	return (
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
						Our team is preparing insightful articles, guides, and case studies
						to help you get the most out of your events. Stay tuned.
					</p>

					{/* Decorative line */}
					<div className="mx-auto mt-12 h-[2px] w-16 bg-black/20" />
				</motion.div>
			</div>
		</section>
	);
});
