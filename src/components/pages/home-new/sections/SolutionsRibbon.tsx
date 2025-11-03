"use client";

import type React from "react";
import { motion } from "framer-motion";

const SolutionsRibbon: React.FC = () => {
	return (
		<section className="bg-primary px-4 py-16 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="space-y-4"
				>
					<div className="mb-4">
						<span className="inline-block rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">
							Complete Solution Suite
						</span>
					</div>
					<h2 className="text-xl font-semibold text-primary-foreground sm:text-3xl lg:text-4xl">
						Every Tool You Need to Execute
						<br />
						Flawless Events at Scale
					</h2>
					<p className="mx-auto max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
						From registration to retargeting, EventzFlow delivers enterprise-grade technology
						that transforms complex event operations into seamless, data-driven experiences.
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default SolutionsRibbon;
