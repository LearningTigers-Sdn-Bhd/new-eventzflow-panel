"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";

const SolutionsRibbon: React.FC = () => {
	return (
		<section className="bg-primary px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
			<div className="mx-auto max-w-7xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="space-y-3 sm:space-y-4"
				>
					<div className="mb-3 sm:mb-4">
						<span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground sm:px-4 sm:text-xs">
							<Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							Complete Solution Suite
						</span>
					</div>
					<h2 className="px-2 text-xl font-semibold text-primary-foreground sm:text-2xl lg:text-3xl xl:text-4xl">
						Every Tool You Need to Execute
						<br />
						Flawless Events at Scale
					</h2>
					<p className="mx-auto max-w-2xl px-2 text-sm text-primary-foreground/90 sm:text-base lg:text-lg">
						From registration to retargeting, EventzFlow delivers enterprise-grade technology
						that transforms complex event operations into seamless, data-driven experiences.
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default SolutionsRibbon;
