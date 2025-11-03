"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	CalendarRange,
	Compass,
	Handshake,
	IdCard,
	Share2,
} from "lucide-react";

const valuePropositions = [
	{
		icon: CalendarRange,
		title: "Slash Event Costs by 60%",
		copy: "Eliminate manual labor and reduce operational overhead with intelligent automation. Cut staff requirements, minimize printing costs, and streamline workflows to deliver exceptional events at a fraction of traditional costs.",
		pills: ["Cost reduction", "Automation savings", "Efficiency gains"],
	},
	{
		icon: IdCard,
		title: "Launch Events 10x Faster",
		copy: "Go from concept to live event in minutes, not weeks. Pre-built templates, instant WhatsApp integration, and zero-code setup mean your team can deploy professional event platforms faster than ever before.",
		pills: ["Quick setup", "Instant deployment", "Ready templates"],
	},
	{
		icon: Compass,
		title: "Maximize Attendee Engagement",
		copy: "Transform passive attendees into active participants with interactive tools, gamification, and real-time engagement features. Boost participation rates by up to 250% and create memorable experiences that attendees talk about.",
		pills: ["Engagement boost", "Interactive tools", "Live feedback"],
	},
	{
		icon: Share2,
		title: "Convert Leads Into Revenue",
		copy: "Turn event attendance into measurable business growth. AI-powered behavioral insights and automated follow-up campaigns help you identify high-intent prospects and nurture them into long-term customers with proven conversion strategies.",
		pills: ["Lead conversion", "Revenue growth", "Smart retargeting"],
	},
];

const JourneySection: React.FC = () => {
	return (
		<section
			id="pain-points"
			className="bg-background px-4 py-20 sm:px-6 lg:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<div className="mb-14 flex flex-col gap-6 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
					<div>
						<motion.span
							className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground"
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
						>
							Why Choose EventzFlow
						</motion.span>
						<motion.h2
							className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl"
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.05 }}
						>
							Work Smarter, Save More,
							<br />
							Deliver Better Events
						</motion.h2>
					</div>
					<motion.p
						className="text-lg text-muted-foreground lg:max-w-xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						Less manual work. Lower costs. Happier attendees. EventzFlow automates 
						the tedious tasks so you can focus on creating exceptional experiences.
					</motion.p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{valuePropositions.map((value, index) => {
						const Icon = value.icon;
						return (
							<motion.div
								key={value.title}
								className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.07 }}
							>
								{/* Gradient overlay on hover */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								
								<div className="relative">
									<div className="mb-6 flex items-start gap-4">
										<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15 group-hover:ring-primary/30">
											<Icon className="h-7 w-7" />
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-bold text-card-foreground transition-colors group-hover:text-primary">
												{value.title}
											</h3>
											<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
												{value.copy}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap gap-2">
										{value.pills.map((pill) => (
											<span
												key={pill}
												className="inline-flex items-center rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary"
											>
												{pill}
											</span>
										))}
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>

				<motion.div
					className="mt-12 flex flex-col items-center gap-6 rounded-3xl bg-primary px-8 py-10 text-center text-primary-foreground lg:flex-row lg:justify-between lg:text-left"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
							<Handshake className="h-6 w-6" />
						</div>
						<div>
							<p className="text-lg font-semibold">Quick setup in minutes</p>
							<p className="text-sm opacity-90">
								Launch your complete event management platform in under 5 minutes with instant WhatsApp integration.
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<span className="rounded-full border border-primary-foreground/20 px-4 py-2 text-xs uppercase tracking-widest">
							24/7 Automation
						</span>
						<span className="rounded-full border border-primary-foreground/20 px-4 py-2 text-xs uppercase tracking-widest">
							Full API Access
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default JourneySection;
