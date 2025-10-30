"use client";

import React from "react";
import {
	UserPlus,
	Printer,
	MapPin,
	Brain,
	Target,
	BarChart3,
	CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const FeaturesSection: React.FC = () => {
	const features = [
		{
			icon: UserPlus,
			title: "Smart Registration",
			description:
				"Online registration with WhatsApp automation and multi-language support. Streamline attendee onboarding from start to finish.",
			items: [
				"Automated WhatsApp workflows",
				"Multi-language support",
				"Custom registration forms",
				"Instant ticket delivery",
			],
		},
		{
			icon: Printer,
			title: "Check-in & Badge Printing",
			description:
				"QR code validation with instant on-demand badge printing at multiple entry points. Professional access control made simple.",
			items: [
				"QR code scanning",
				"Instant badge printing",
				"Multi-point access control",
				"Real-time validation",
			],
		},
		{
			icon: MapPin,
			title: "Booth Tracking",
			description:
				"Real-time visitor booth tracking with heat maps and dwell time analytics. Understand visitor movement patterns.",
			items: [
				"Live visitor tracking",
				"Heat map visualization",
				"Dwell time analytics",
				"Popular booth insights",
			],
		},
		{
			icon: Brain,
			title: "AI Audience Profiling",
			description:
				"Intelligent visitor profiling with behavioral analysis and interest mapping for deeper event insights.",
			items: [
				"Automated segmentation",
				"Behavioral analysis",
				"Engagement scoring",
				"Predictive insights",
			],
		},
		{
			icon: Target,
			title: "Smart Retargeting",
			description:
				"AI-powered retargeting campaigns based on visitor behavior and preferences with automated follow-ups.",
			items: [
				"Automated campaigns",
				"Personalized content",
				"Multi-channel engagement",
				"ROI tracking",
			],
		},
		{
			icon: BarChart3,
			title: "Real-time Analytics",
			description:
				"Comprehensive dashboard with live metrics, visitor insights, and performance tracking for data-driven decisions.",
			items: [
				"Live dashboards",
				"Visitor insights",
				"Performance tracking",
				"Export reports",
			],
		},
	];

	return (
		<section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
			<div className="container mx-auto max-w-7xl">
				{/* Section Header */}
				<div className="mb-16 text-center">
					<motion.p
						className="mb-4 text-sm font-medium uppercase tracking-wider text-green-600"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						PLATFORM FEATURES
					</motion.p>
					<motion.h2
						className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						Complete Registration Management
					</motion.h2>
					<motion.p
						className="mx-auto max-w-3xl text-lg text-muted-foreground"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						From online registration and WhatsApp automation to seamless
						check-in and on-demand badge printing
					</motion.p>
				</div>

				{/* Features Grid */}
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<motion.div
								key={index}
								className="rounded-2xl border bg-background p-8 shadow-sm transition-shadow hover:shadow-md"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								{/* Icon */}
								<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
									<IconComponent className="h-6 w-6" />
								</div>

								{/* Title */}
								<h3 className="mb-3 text-xl font-semibold text-foreground">
									{feature.title}
								</h3>

								{/* Description */}
								<p className="mb-4 text-muted-foreground">
									{feature.description}
								</p>

								{/* Feature Items */}
								<ul className="space-y-2">
									{feature.items.map((item, itemIndex) => (
										<li
											key={itemIndex}
											className="flex items-start gap-2 text-sm text-muted-foreground"
										>
											<CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</motion.div>
						);
					})}
				</div>

				{/* Stats */}
				<motion.div
					className="mt-20 grid gap-8 text-center md:grid-cols-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					{[
						{ value: "5K+", label: "Event Organizers" },
						{ value: "99.9%", label: "Platform Uptime" },
						{ value: "50+", label: "Event Categories" },
						{ value: "24/7", label: "Event Support" },
					].map((stat, index) => (
						<div key={index}>
							<div className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
								{stat.value}
							</div>
							<div className="text-sm text-muted-foreground">{stat.label}</div>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default FeaturesSection;

