"use client";

import { motion } from "framer-motion";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function HeroSection() {
	return (
		<section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-black px-6 py-32">
			{/* Left vertical accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, ease: SMOOTH_EASE }}
				className="absolute left-6 top-0 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
			/>

			{/* Content */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				className="text-center max-w-4xl"
			>
				<p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">
					About Us
				</p>
				<h1 className="font-black text-3xl uppercase tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
					The Future of Event Management
				</h1>
				<p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
					At EventzFlow, we're building the next generation of event
					technology. Our mission is to empower organizers with tools that are
					not only powerful but also a joy to use.
				</p>
			</motion.div>
		</section>
	);
}
