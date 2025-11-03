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
		<section className="bg-secondary py-16">
			<div className="flex flex-col gap-8 px-8 lg:flex-row lg:items-start lg:gap-12 lg:px-16">
				<div className="flex flex-1 gap-8">
					{benefits.map((item, index) => {
						const Icon = item.icon;
							return (
							<motion.div
								key={item.label}
								className="flex flex-1 flex-col items-center text-center"
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: index * 0.05 }}
							>
								<div className="mb-4">
									<Icon className="h-12 w-12 text-primary" />
								</div>
								<h3 className="mb-2 text-lg font-bold text-foreground">
									{item.label}
										</h3>
										<p className="text-sm leading-relaxed text-muted-foreground">
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
