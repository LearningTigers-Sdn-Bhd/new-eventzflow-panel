"use client";

import { motion } from "framer-motion";
import { Award, HandCoins, Heart, Shield, Users } from "lucide-react";
import type React from "react";

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

export const ValuesSection: React.FC = () => {
	const cultureTraits = [
		{
			icon: Heart,
			title: "Customer success first",
			description:
				"We care about your event outcomes, not just software features. Your success is how we measure our own progress.",
		},
		{
			icon: Users,
			title: "Built with feedback",
			description:
				"We actively listen to organizers, vendors, and attendees. Every conversation helps us build something better.",
		},
		{
			icon: Award,
			title: "Quality & simplicity",
			description:
				"Clean interfaces, reliable performance, and features that actually work. We keep things simple so you can focus on your events.",
		},
		{
			icon: Shield,
			title: "Security by design",
			description:
				"We take data protection seriously from day one. Your attendee information is encrypted and handled with care.",
		},
	];

	return (
		<section className="bg-muted/40 py-12 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-8 sm:gap-10 lg:grid-cols-3 lg:items-start">
					<motion.div
						className="space-y-3 px-2 sm:space-y-4"
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 font-semibold text-[10px] text-primary uppercase tracking-[0.25em] sm:px-4 sm:py-2 sm:text-xs">
							<HandCoins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							<span>Our Values</span>
						</div>
						<h2 className="font-bold text-2xl text-foreground sm:text-3xl lg:text-4xl">
							What we stand for
						</h2>
						<p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
							These aren't just words on a wall. They guide every decision we
							make, every feature we ship, and every conversation we have with
							our customers.
						</p>
					</motion.div>

					<motion.div
						className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:col-span-2"
						variants={container}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.2 }}
					>
						{cultureTraits.map((trait) => {
							const Icon = trait.icon;
							return (
								<motion.div
									key={trait.title}
									variants={item}
									transition={{ duration: 0.5, ease: "easeOut" }}
									className="hover:-translate-y-1 h-full rounded-xl border border-border/50 bg-card/80 p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:rounded-2xl sm:p-6"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 hover:bg-primary/20 sm:h-12 sm:w-12 sm:rounded-xl">
										<Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
									</div>
									<h3 className="mt-3 font-semibold text-base text-foreground sm:mt-4 sm:text-lg">
										{trait.title}
									</h3>
									<p className="mt-1.5 text-muted-foreground text-xs leading-relaxed sm:mt-2 sm:text-sm">
										{trait.description}
									</p>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</div>
		</section>
	);
};
