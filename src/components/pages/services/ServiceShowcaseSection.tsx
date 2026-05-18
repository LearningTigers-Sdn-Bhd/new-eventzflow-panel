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
		<section className="border border-black bg-white-background px-6 py-24 md:py-32">
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
							<p className="font-bold text-black text-xs uppercase tracking-[0.4em]">
								{label}
							</p>
						</div>
						<h2 className="font-black text-3xl text-black uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
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
								<div className="absolute top-1/4 -left-32 hidden lg:block">
									<div className="mb-4 h-px w-20 bg-black/20" />
									<p className="whitespace-pre-line text-right font-medium text-black/40 text-xs uppercase tracking-widest">
										{decorativeLabels.top}
									</p>
								</div>
							)}
							{decorativeLabels?.bottom && (
								<div className="absolute bottom-1/4 -left-32 hidden lg:block">
									<div className="mb-4 h-px w-20 bg-black/20" />
									<p className="whitespace-pre-line text-right font-medium text-black/40 text-xs uppercase tracking-widest">
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
						<p className="mb-8 text-base text-black/60 leading-relaxed md:text-lg">
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
									<span className="font-bold text-black/40 text-xs tracking-widest transition-colors group-hover:text-black/60">
										{item.number}
									</span>
									<span className="font-medium text-base text-black transition-colors">
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
