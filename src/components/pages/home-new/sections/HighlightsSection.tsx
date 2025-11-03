"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	QrCode,
	Users,
	MapPin,
	Handshake,
	BarChart3,
	LayoutDashboard,
} from "lucide-react";

const highlights = [
	{
		icon: QrCode,
		title: "Event Ticketing & Registration",
		description: "Branded registration pages with WhatsApp automation, multi-tier ticketing, and instant payment processing.",
		items: [
			"Automated WhatsApp reminders & campaigns",
			"Custom ticket bundles with add-ons",
			"Branded microsites & landing pages",
		],
	},
	{
		icon: Users,
		title: "Interactive Crowd Engagement",
		description: "Boost participation with gamification, live polls, and interactive activities that keep attendees engaged throughout your event.",
		items: [
			"Real-time polls & live Q&A sessions",
			"Gamification with leaderboards & rewards",
			"Push notifications & personalized content",
		],
	},
	{
		icon: BarChart3,
		title: "AI Audience Profiling & Retargeting",
		description: "Behavioral profiling with booth heat maps, dwell time analytics, and automated retargeting campaigns via WhatsApp & email.",
		items: [
			"Booth heat maps & dwell time tracking",
			"AI audience segmentation by behavior",
			"Automated retargeting & follow-ups",
		],
	},
	{
		icon: MapPin,
		title: "Visitor Booth Tracking",
		description: "Track visitor movement patterns across exhibition halls with precise booth visit tracking and comprehensive engagement analytics.",
		items: [
			"Real-time booth visit tracking",
			"Heat maps & traffic flow analysis",
			"Exhibitor ROI & engagement metrics",
		],
	},
	{
		icon: Handshake,
		title: "Business Matching",
		description: "Intelligent business matching algorithms connect exhibitors with qualified prospects through pre-scheduled appointments.",
		items: [
			"AI-powered exhibitor-visitor matching",
			"Pre-scheduled appointment booking",
			"Automated meeting reminders & confirmations",
		],
	},
	{
		icon: LayoutDashboard,
		title: "End-to-End Dashboard",
		description: "Monitor your entire event from a single command center with real-time insights for exhibitors & organizers.",
		items: [
			"Real-time attendance & capacity tracking",
			"Live check-in statistics & analytics",
			"Comprehensive reports & data export",
		],
	},
];

const HighlightsSection: React.FC = () => {
	return (
		<section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-16 text-center">
					<motion.span
						className="mb-3 inline-block rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground"
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						Enterprise-Grade Capabilities
					</motion.span>
					<motion.h2
						className="text-3xl font-semibold text-foreground sm:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.05 }}
					>
						Transform Every Attendee Into a Valuable Business Opportunity
					</motion.h2>
					<motion.p
						className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.08 }}
					>
						EventzFlow empowers organizers and exhibitors with intelligent automation, real-time analytics, 
						and AI-driven insights to maximize ROI at every stage—from seamless registration to strategic 
						post-event retargeting that converts attendees into long-term customers.
					</motion.p>
				</div>

				<div className="flex flex-wrap justify-center gap-6">
					{highlights.map((item, index) => {
						const Icon = item.icon;
						return (
							<motion.div
								key={item.title}
								className="group relative flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-muted/30 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: index * 0.05 }}
								whileHover={{ y: -4 }}
							>
								{/* Gradient background effect on hover */}
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								
								{/* Icon with gradient background */}
								<div className="relative">
									<div className="inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/20">
										<Icon className="h-6 w-6 text-primary" strokeWidth={2} />
									</div>
								</div>
								
								{/* Content */}
								<div className="relative flex flex-col gap-4">
									<div>
										<h4 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
											{item.title}
										</h4>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{item.description}
								</p>
									</div>

									{/* Bullet Points */}
									<ul className="space-y-2.5 text-sm text-muted-foreground">
										{item.items.map((bullet) => (
											<li key={bullet} className="flex items-start gap-2">
												<span className="mt-[6px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
												<span>{bullet}</span>
											</li>
										))}
									</ul>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default HighlightsSection;
