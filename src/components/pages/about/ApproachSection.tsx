"use client";

import { motion } from "framer-motion";
import { Pickaxe, Target, TrendingUp, Users, Zap } from "lucide-react";
import type React from "react";

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.12,
			delayChildren: 0.2,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

export const ApproachSection: React.FC = () => {
	const approachPrinciples = [
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

	return (
		<section className="py-12 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					className="mb-8 space-y-3 text-center sm:mb-10 sm:space-y-4 lg:mb-12"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.25em] sm:px-4 sm:py-2 sm:text-xs">
						<Pickaxe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span>How We Work</span>
					</div>
					<h2 className="px-2 font-bold text-2xl text-foreground sm:text-3xl lg:text-4xl">
						Our approach to building great products
					</h2>
					<p className="mx-auto max-w-2xl px-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
						We believe the best solutions come from listening, iterating, and
						staying close to the people who use what we build every day.
					</p>
				</motion.div>

				<motion.div
					className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}
				>
					{approachPrinciples.map((principle) => {
						const Icon = principle.icon;
						return (
							<motion.div
								key={principle.title}
								variants={item}
								transition={{ duration: 0.5, ease: "easeOut" }}
								className="hover:-translate-y-1 h-full rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:rounded-2xl sm:p-6"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 hover:bg-primary/20 sm:h-12 sm:w-12">
									<Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
								</div>
								<h3 className="mt-3 font-semibold text-foreground text-sm sm:mt-4 sm:text-base">
									{principle.title}
								</h3>
								<p className="mt-1.5 text-muted-foreground text-xs leading-relaxed sm:mt-2 sm:text-sm">
									{principle.description}
								</p>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
};
