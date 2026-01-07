"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type React from "react";

const CTASection: React.FC = () => {
	return (
		<section className="relative bg-white px-6 py-20 md:px-12">
			<div className="mx-auto max-w-7xl">
				{/* Main Content */}
				<div className="flex flex-col items-center text-center">
					{/* Eyebrow */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
						className="mb-8 flex items-center gap-4"
					>
						<div className="h-px w-12 bg-black/30" />
						<span className="text-xs tracking-[0.3em] text-black/50">
							READY TO TRANSFORM YOUR EVENTS?
						</span>
						<div className="h-px w-12 bg-black/30" />
					</motion.div>

					{/* Headline */}
					<motion.h2
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
						className="font-black text-6xl tracking-tighter text-black md:text-8xl lg:text-9xl"
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
						className="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-4"
					>
						<button
							type="button"
							className="group flex items-center justify-center gap-3 bg-black px-12 py-5 font-bold text-sm tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
						>
							GET STARTED
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
						</button>
						<button
							type="button"
							className="flex items-center justify-center border border-black/20 px-12 py-5 font-bold text-sm tracking-wide text-black/70 transition-all duration-300 hover:-translate-y-1 hover:border-black hover:text-black"
						>
							TALK TO SALES
						</button>
					</motion.div>

					{/* Trust Element */}
					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className="mt-8 text-xs tracking-wide text-black/40"
					>
						✓ No credit card required  ·  ✓ Setup easily  ·  ✓ Clear guidelines
					</motion.p>
				</div>
			</div>
		</section>
	);
};

export default CTASection;
