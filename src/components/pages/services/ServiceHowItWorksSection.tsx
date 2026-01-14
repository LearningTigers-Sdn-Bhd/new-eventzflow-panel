"use client";

import { motion } from "framer-motion";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export interface ServiceStep {
	number: string;
	title: string;
	description: string;
}

interface ServiceHowItWorksSectionProps {
	label?: string;
	title: string;
	steps: ServiceStep[];
}

export default function ServiceHowItWorksSection({
	label = "How It Works",
	title,
	steps,
}: ServiceHowItWorksSectionProps) {
	return (
		<section className="bg-green-background px-6 py-24 md:py-32 border border-black">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-16 text-center md:mb-20">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					>
						<p className="mb-4 font-medium text-neutral-600 text-xs uppercase tracking-[0.3em]">
							{label}
						</p>
						<h2 className="font-bold text-3xl text-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
							{title}
						</h2>
					</motion.div>
				</div>

				{/* Steps */}
				<div className="grid gap-8 md:grid-cols-3 md:gap-12">
					{steps.map((step, index) => (
						<motion.div
							key={step.number}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.8,
								delay: index * 0.2,
								ease: SMOOTH_EASE,
							}}
							className="relative"
						>
							{/* Connector line */}
							{index < steps.length - 1 && (
								<div className="absolute top-8 left-1/2 hidden h-px w-full bg-black md:block" />
							)}

							<div className="relative text-center">
								{/* Number */}
								<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-black bg-white">
									<span className="font-bold text-black text-xl">
										{step.number}
									</span>
								</div>

								{/* Content */}
								<h3 className="mb-3 font-bold text-black text-xl md:text-2xl">
									{step.title}
								</h3>
								<p className="text-base text-neutral-600 leading-relaxed md:text-lg">
									{step.description}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
