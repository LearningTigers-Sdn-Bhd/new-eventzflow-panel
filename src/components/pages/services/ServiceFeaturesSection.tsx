"use client";

import { motion } from "framer-motion";

export interface ServiceFeature {
	id: string;
	title: string;
	category: string;
	description: string;
}

interface ServiceFeaturesSectionProps {
	title: string;
	titleSecondLine?: string;
	subtitle: string;
	features: ServiceFeature[];
}

export default function ServiceFeaturesSection({
	title,
	titleSecondLine,
	subtitle,
	features,
}: ServiceFeaturesSectionProps) {
	return (
		<section className="bg-white-background px-4 py-12 md:px-8 md:py-26 border border-black">
			<div className="mx-auto max-w-[1600px]">
				{/* Header */}
				<div className="mb-16 flex flex-col justify-between gap-12 md:mb-24 md:flex-row md:items-end">
					<div className="flex flex-col gap-6">
						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
							className="font-black text-5xl text-black uppercase leading-[0.9] tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl"
						>
							{title}
							{titleSecondLine && (
								<>
									<br />
									{titleSecondLine}
								</>
							)}
						</motion.h2>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="relative flex max-w-sm flex-col gap-6 pt-6"
					>
						<div className="absolute top-0 left-0 h-2 w-12 bg-brand-green" />
						<p className="font-medium text-base text-neutral-800 leading-relaxed md:text-lg">
							{subtitle}
						</p>
					</motion.div>
				</div>

				{/* Interactive List */}
				<div className="flex flex-col">
					{features.map((feature, index) => (
						<motion.div
							key={feature.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.05 }}
							className="group relative flex cursor-default flex-col gap-4 border-black border-t py-10 transition-colors duration-500 hover:bg-black md:flex-row md:items-start md:justify-between md:gap-6 md:py-16 md:pr-12 md:pl-8"
						>
							{/* Index */}
							<div className="flex w-full items-baseline justify-between md:w-1/4 md:justify-start md:gap-8">
								<span className="font-bold text-5xl text-brand-green leading-none transition-colors group-hover:text-white/30 md:text-7xl">
									{feature.id}
								</span>
							</div>

							{/* Title */}
							<div className="w-full md:w-2/4">
								<h3 className="font-bold text-3xl text-black uppercase tracking-tighter transition-colors duration-500 group-hover:text-white md:text-6xl">
									{feature.title}
								</h3>
							</div>

							{/* Description */}
							<div className="flex w-full flex-col justify-start md:w-1/4">
								<p className="max-w-md font-medium text-base text-neutral-600 leading-relaxed transition-colors group-hover:text-neutral-300 md:text-lg">
									{feature.description}
								</p>
							</div>
						</motion.div>
					))}
					{/* Final Border */}
					<div className="h-px w-full bg-black" />
				</div>
			</div>
		</section>
	);
}
