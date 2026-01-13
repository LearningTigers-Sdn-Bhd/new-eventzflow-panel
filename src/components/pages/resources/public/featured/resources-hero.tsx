"use client";

import { motion } from "framer-motion";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export function ResourcesHero() {
	return (
		<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
			{/* Left vertical accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.2, ease: SMOOTH_EASE }}
				className="absolute top-0 left-6 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
			/>

			{/* Content */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: 0.2 }}
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
	);
}
