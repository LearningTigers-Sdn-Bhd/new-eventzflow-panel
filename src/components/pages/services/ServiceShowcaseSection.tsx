"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export interface ServiceShowcaseHighlight {
	number: string;
	text: string;
}

interface ServiceShowcaseSectionProps {
	label: string;
	title: string;
	description: string;
	highlights: ServiceShowcaseHighlight[];
	children: ReactNode;
	decorativeLabels?: { top?: string; bottom?: string };
}

export default function ServiceShowcaseSection({
	label,
	title,
	description,
	highlights,
	children,
	decorativeLabels,
}: ServiceShowcaseSectionProps) {
	return (
		<section className="bg-white px-6 py-24 md:py-32 border border-black">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-16 md:mb-20">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="max-w-6xl"
					>
						<div className="mb-6 flex items-center gap-4">
							<div className="h-[2px] w-10 bg-black" />
							<p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
								{label}
							</p>
						</div>
						<h2 className="font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
							{title}
						</h2>
					</motion.div>
				</div>

				{/* Content Grid */}
				<div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
					{/* Left - Visual/Demo */}
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
						className="flex justify-center lg:justify-start"
					>
						<div className="relative w-full lg:ml-40">
							{/* Decorative elements */}
							{decorativeLabels?.top && (
								<div className="absolute -left-32 top-1/4 hidden lg:block">
									<div className="mb-4 h-px w-20 bg-black/20" />
									<p className="text-right text-xs font-medium uppercase tracking-widest text-black/40 whitespace-pre-line">
										{decorativeLabels.top}
									</p>
								</div>
							)}
							{decorativeLabels?.bottom && (
								<div className="absolute -left-32 bottom-1/4 hidden lg:block">
									<div className="mb-4 h-px w-20 bg-black/20" />
									<p className="text-right text-xs font-medium uppercase tracking-widest text-black/40 whitespace-pre-line">
										{decorativeLabels.bottom}
									</p>
								</div>
							)}

							{children}
						</div>
					</motion.div>

					{/* Right - Content */}
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2, ease: SMOOTH_EASE }}
					>
						<p className="mb-8 text-base leading-relaxed text-black/60 md:text-lg">
							{description}
						</p>

						{/* Highlights */}
						<div className="grid gap-1 sm:grid-cols-2">
							{highlights.map((item, index) => (
								<motion.div
									key={item.number}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.6,
										delay: 0.3 + index * 0.1,
										ease: SMOOTH_EASE,
									}}
									className="group flex items-center gap-4 border border-black/10 bg-black/[0.02] p-4 transition-all duration-300 hover:bg-brand-green md:p-5"
								>
									<span className="font-bold text-xs tracking-widest text-black/40 transition-colors group-hover:text-black/60">
										{item.number}
									</span>
									<span className="text-base font-medium text-black transition-colors">
										{item.text}
									</span>
								</motion.div>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
