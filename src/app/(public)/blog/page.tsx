"use client";

import { motion } from "framer-motion";

const smoothEase = [0.25, 0.46, 0.45, 0.94];

export default function BlogPage() {
	return (
		<main>
			{/* Hero Section */}
			<section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-24">
				{/* Left vertical accent line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 1.5, ease: smoothEase }}
					className="absolute left-6 top-0 h-[70%] w-[2px] origin-top bg-white md:left-12 lg:left-16"
				/>

				{/* Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: smoothEase }}
					className="text-center"
				>
					<p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
						Insights & Updates
					</p>
					<h1 className="font-black text-6xl uppercase tracking-tighter text-white md:text-7xl lg:text-8xl">
						Blog
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
						transition={{ duration: 0.8, ease: smoothEase }}
					>
						{/* Decorative line */}
						<div className="mx-auto mb-8 h-[2px] w-16 bg-black/20" />

						<p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-black/40">
							Coming Soon
						</p>
						<h2 className="mb-6 font-black text-4xl uppercase tracking-tighter text-black md:text-5xl">
							We're working on it
						</h2>
						<p className="mx-auto max-w-xl text-base leading-relaxed text-black/60 md:text-lg">
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
