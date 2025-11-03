"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	Bot,
	Database,
	FileText,
	IdCard,
	Key,
	MapPin,
	MessagesSquare,
	Radar,
	Shield,
	Sparkles,
	Ticket,
} from "lucide-react";

const pillars = [
	{
		icon: MessagesSquare,
		title: "Pre-Event Registration & Automation",
		copy: "Branded registration pages with WhatsApp automation, multi-tier ticketing, and instant payment processing.",
		items: [
			"Automated WhatsApp reminders & campaigns",
			"Custom ticket bundles with add-ons",
			"Branded microsites & landing pages",
		],
	},
	{
		icon: IdCard,
		title: "Lightning-Fast On-Site Operations",
		copy: "QR validation and instant badge printing in under 3 seconds. Real-time capacity monitoring and multi-gate access control.",
		items: [
			"QR check-in & badge print in 3 seconds",
			"Live hall capacity & crowd monitoring",
			"Multi-gate access management",
		],
	},
	{
		icon: Radar,
		title: "AI-Powered Post-Event Intelligence",
		copy: "Behavioral profiling with booth heat maps, dwell time analytics, and automated retargeting campaigns via WhatsApp & email.",
		items: [
			"Booth heat maps & dwell time tracking",
			"AI audience segmentation by behavior",
			"Automated retargeting & follow-ups",
		],
	},
];

const featureTiles = [
	{
		icon: Ticket,
		title: "Dynamic ticketing & payments",
		description:
			"Multi-tier ticketing with custom fields, promo codes, payment tracking, and instant QR delivery.",
	},
	{
		icon: MapPin,
		title: "Multi-location management",
		description:
			"Track entries across multiple gates, halls, and zones with staff assignment per location.",
	},
	{
		icon: Shield,
		title: "Team & role management",
		description:
			"Granular access control with event staff assignments, team permissions, and activity tracking.",
	},
	{
		icon: Database,
		title: "Custom data collection",
		description:
			"Create unlimited custom fields for attendee data, dietary requirements, sessions, and more.",
	},
	{
		icon: FileText,
		title: "Export & reporting",
		description:
			"Comprehensive analytics exports, scanned logs, audit trails, and real-time event reports.",
	},
	{
		icon: Bot,
		title: "Self check-in kiosks",
		description:
			"Attendees can check themselves in via email/phone lookup on public kiosks.",
	},
	{
		icon: Key,
		title: "Full API access",
		description:
			"REST API with authentication keys for custom integrations and third-party platforms.",
	},
	{
		icon: Sparkles,
		title: "Real-time control center",
		description:
			"Live monitoring of all touchpoints with instant alerts, capacity tracking, and performance metrics.",
	},
];

const SolutionsSection: React.FC = () => {
	return (
		<section id="feature-showcase" className="bg-background px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-16 text-center">
					<motion.span
						className="mb-3 inline-block rounded-full bg-accent px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-accent-foreground"
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						End-to-end orchestration
					</motion.span>
					<motion.h2
						className="text-3xl font-semibold text-foreground sm:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.05 }}
					>
						Complete event management from registration to retargeting
					</motion.h2>
					<motion.p
						className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.08 }}
					>
						EventzFlow unifies every phase of your event into one powerful platform—from 
						WhatsApp-powered registration to AI-driven post-event analytics. Built for 
						large conferences, trade shows, corporate events, and government summits.
					</motion.p>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{pillars.map((pillar, index) => {
						const Icon = pillar.icon;
						return (
							<motion.div
								key={pillar.title}
								className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Icon className="h-6 w-6" />
								</div>
								<div>
									<h3 className="text-xl font-semibold text-foreground">
										{pillar.title}
									</h3>
									<p className="mt-3 text-muted-foreground">{pillar.copy}</p>
								</div>
								<ul className="space-y-3 text-sm text-muted-foreground">
									{pillar.items.map((item) => (
										<li key={item} className="flex items-start gap-2">
											<span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</motion.div>
						);
					})}
				</div>

				<div className="mt-20 flex flex-wrap justify-center gap-6">
					{featureTiles.map((tile, index) => {
						const Icon = tile.icon;
						return (
							<motion.div
								key={tile.title}
								className="group relative flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-muted/30 p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
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
								<div className="relative">
									<h4 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
										{tile.title}
									</h4>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{tile.description}
									</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default SolutionsSection;
