"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	Zap,
	Shield,
	Clock,
	TrendingUp,
	FlameIcon,
} from "lucide-react";

const benefits = [
	{
		icon: Zap,
		label: "Lightning-Fast Efficiency",
		description:
			"Streamline your entire event workflow from registration to post-event analytics. Automate repetitive tasks and focus on exceptional experiences.",
	},
	{
		icon: Shield,
		label: "Enterprise-Grade Security",
		description:
			"Comprehensive tracking, real-time monitoring, and duplicate detection ensure smooth, error-free events you can trust.",
	},
	{
		icon: Clock,
		label: "Massive Time & Cost Savings",
		description:
			"Eliminate manual work with automated check-in, instant badge printing, and WhatsApp automation. Execute events in a fraction of the time.",
	},
	{
		icon: TrendingUp,
		label: "Data-Driven Growth",
		description:
			"Real-time event data, booth analytics, and attendee insights empower your team to make data-driven decisions on the fly.",
	},
];

const BenefitsSection: React.FC = () => {
	return (
		<section className="relative border-primary border-y bg-secondary px-4 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 lg:pt-24 lg:pb-14 dark:bg-background">
			<div className="mx-auto max-w-7xl">
				<motion.div
					className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					<div className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-2 shadow-lg sm:px-8 sm:py-3">
						<FlameIcon className="h-3.5 w-3.5 text-background sm:h-4 sm:w-4" />
						<span className="whitespace-nowrap font-bold text-background text-xs uppercase tracking-wider sm:text-sm">
							Here's What We Bring to You
						</span>
					</div>
				</motion.div>
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{benefits.map((item, index) => {
						const Icon = item.icon;
							return (
							<motion.div
								key={item.label}
								className="flex flex-col items-center text-center"
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: index * 0.1 }}
							>
								<div className="mb-3 sm:mb-4">
									<Icon className="h-9 w-9 text-primary sm:h-10 sm:w-10" />
								</div>
								<h3 className="mb-2 font-extrabold text-base text-foreground sm:mb-2.5 sm:text-lg">
									{item.label}
										</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">
									{item.description}
										</p>
							</motion.div>
							);
						})}
				</div>
			</div>
		</section>
	);
};

export default BenefitsSection;

