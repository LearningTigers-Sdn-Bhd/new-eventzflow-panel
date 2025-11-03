"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	Zap,
	Users,
	Shield,
	Clock,
	TrendingUp,
} from "lucide-react";

const benefits = [
	{
		icon: Zap,
		label: "Lightning-Fast Efficiency",
		description:
			"Streamline your entire event workflow from registration to post-event analytics. Automate repetitive tasks and focus on delivering exceptional experiences.",
	},
	{
		icon: Users,
		label: "Seamless Team Communication",
		description:
			"Centralized dashboard enables seamless coordination between organizers, exhibitors, and attendees with real-time updates and automated notifications.",
	},
	{
		icon: Shield,
		label: "Enterprise-Grade Security",
		description:
			"Stay on top of every detail with comprehensive tracking and validation. Real-time monitoring and duplicate detection ensure smooth, error-free events.",
	},
	{
		icon: Clock,
		label: "Massive Time & Cost Savings",
		description:
			"Eliminate manual work with automated check-in, instant badge printing, and WhatsApp automation. Deliver flawlessly executed events in a fraction of the time.",
	},
	{
		icon: TrendingUp,
		label: "Data-Driven Growth",
		description:
			"Real-time access to event data, booth analytics, and attendee insights empowers your team to make data-driven decisions and optimize on the fly.",
	},
];

const BenefitsSection: React.FC = () => {
	return (
		<section className="bg-secondary px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5 lg:gap-6">
					{benefits.map((item, index) => {
						const Icon = item.icon;
							return (
							<motion.div
								key={item.label}
								className="flex flex-col items-center text-center"
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: index * 0.05 }}
							>
								<div className="mb-3 sm:mb-4">
									<Icon className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
								</div>
								<h3 className="mb-2 text-base font-bold text-foreground sm:text-lg">
									{item.label}
										</h3>
										<p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
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
