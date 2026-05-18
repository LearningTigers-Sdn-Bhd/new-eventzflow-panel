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
				className="absolute top-0 left-6 hidden h-[70%] w-[2px] origin-top bg-white md:left-12 md:block lg:left-16"
			/>

			{/* Content */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				className="max-w-4xl text-center"
			>
				<p className="mb-4 font-medium text-sm text-white/60 uppercase tracking-[0.3em]">
					About Us
				</p>
				<h1 className="font-black text-3xl text-white uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
					The Future of Event Management
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
					At EventzFlow, we're building the next generation of event technology.
					Our mission is to empower organizers with tools that are not only
					powerful but also a joy to use.
				</p>
			</motion.div>
		</section>
	);
}
