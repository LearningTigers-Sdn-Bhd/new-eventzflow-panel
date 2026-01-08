"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";

const CTASection: React.FC = () => {
	return (
		<section className="relative bg-white px-6 py-16 md:py-20 md:px-12">
			<div className="mx-auto max-w-7xl">
				{/* Main Content */}
				<div className="flex flex-col items-center text-center">
					{/* Eyebrow */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
						className="mb-6 flex items-center gap-4 md:mb-8"
					>
						<div className="h-px w-8 bg-black/30 md:w-12" />
						<span className="text-[10px] tracking-[0.2em] text-black/50 sm:text-xs sm:tracking-[0.3em]">
							READY TO TRANSFORM YOUR EVENTS?
						</span>
						<div className="h-px w-8 bg-black/30 md:w-12" />
					</motion.div>

					{/* Headline */}
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						className="font-black text-4xl tracking-tighter text-black sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl"
					>
						RUN BETTER
						<br />
						<span className="text-black/40">EVENTS.</span>
					</motion.h2>

					{/* Description */}
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						className="mt-8 max-w-xl text-lg leading-relaxed text-black/50"
					>
						From registration to check-in to analytics. All in one platform.
					</motion.p>

					{/* CTA Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
						className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4 md:mt-12"
					>
						<Link
							href={"/auth?login" as Route}
							className="group flex items-center justify-center gap-3 bg-black px-8 py-4 font-bold text-sm tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-12 sm:py-5"
						>
							GET STARTED
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Link>
						<Link
							href={"/contact" as Route}
							className="flex items-center justify-center border border-black/20 px-8 py-4 font-bold text-sm tracking-wide text-black/70 transition-all duration-300 hover:-translate-y-1 hover:border-black hover:text-black sm:px-12 sm:py-5"
						>
							TALK TO SALES
						</Link>
					</motion.div>

					{/* Trust Element */}
					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className="mt-6 flex flex-col gap-2 text-xs tracking-wide text-black/40 sm:flex-row sm:gap-4 md:mt-8"
					>
						<span>✓ No credit card required</span>
						<span className="hidden sm:inline">·</span>
						<span>✓ Setup easily</span>
						<span className="hidden sm:inline">·</span>
						<span>✓ Clear guidelines</span>
					</motion.p>
				</div>
			</div>
		</section>
	);
};

export default CTASection;
