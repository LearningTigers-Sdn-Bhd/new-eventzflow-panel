"use client";

import { motion } from "framer-motion";

import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function BlogPageClient() {
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
						Insights & Updates
					</p>
					<h1 className="font-black text-4xl text-white uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
						Resources
					</h1>
				</motion.div>
			</section>

			{/* Coming Soon Section */}
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
							studies to help you get the most out of your events. Stay tuned.
						</p>

						{/* Decorative line */}
						<div className="mx-auto mt-12 h-[2px] w-16 bg-black/20" />
					</motion.div>
				</div>
			</section>
		</main>
	);
}
