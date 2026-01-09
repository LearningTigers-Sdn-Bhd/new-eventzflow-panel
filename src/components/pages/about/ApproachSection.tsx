"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Users, Zap } from "lucide-react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

const approach = [
	{
		icon: Target,
		title: "Listen first, build second",
		description:
			"We actively seek feedback from event organizers to understand real pain points before writing a single line of code.",
	},
	{
		icon: Zap,
		title: "Simplicity over complexity",
		description:
			"Events are stressful enough. We obsess over making powerful features feel effortless to use, even for first-time users.",
	},
	{
		icon: Users,
		title: "Human-centered support",
		description:
			"Real people, real answers. Reach us via WhatsApp or email—no endless phone trees or automated responses.",
	},
	{
		icon: TrendingUp,
		title: "Iterate and improve",
		description:
			"Every event teaches us something new. We're committed to continuous improvement based on real-world usage and feedback.",
	},
];

export default function ApproachSection() {
	return (
		<section className="bg-white px-6 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="mb-16 text-center max-w-3xl mx-auto"
				>
					<div className="mb-6 flex items-center justify-center gap-4">
						<div className="h-[2px] w-10 bg-black" />
						<p className="text-xs font-bold uppercase tracking-[0.4em] text-black">
							How We Work
						</p>
						<div className="h-[2px] w-10 bg-black" />
					</div>
					<h2 className="mb-6 font-black text-3xl uppercase tracking-tighter text-black sm:text-4xl md:text-5xl">
						Our approach to building great products
					</h2>
					<p className="text-lg leading-relaxed text-black/70 md:text-xl">
						We believe the best solutions come from listening, iterating, and
						staying close to the people who use what we build every day.
					</p>
				</motion.div>

				{/* Approach Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4">
					{approach.map((item, index) => {
						const IconComponent = item.icon;
						return (
							<motion.div
								key={item.title}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.6,
									delay: index * 0.1,
									ease: SMOOTH_EASE,
								}}
								whileHover={{ y: -8 }}
								className="group border border-black/10 p-8 transition-all duration-300 hover:border-black hover:shadow-2xl"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/30 text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
									<IconComponent className="h-5 w-5" />
								</div>
								<h3 className="mb-3 font-bold text-lg text-black">
									{item.title}
								</h3>
								<p className="text-base text-black/70 md:text-lg">{item.description}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
