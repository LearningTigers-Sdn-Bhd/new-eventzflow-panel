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
			className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
		>
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex flex-col gap-4 text-center sm:mb-12 sm:gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:text-left">
					<div>
						<motion.span
							className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground sm:px-4 sm:py-2 sm:text-xs"
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
						>
							<span className="whitespace-nowrap">Why Choose EventzFlow</span>
						</motion.span>
						<motion.h2
							className="mt-3 text-2xl font-semibold text-foreground sm:mt-4 sm:text-3xl lg:text-4xl"
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
						className="px-2 text-sm text-muted-foreground sm:text-base lg:max-w-xl lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						Less manual work. Lower costs. Happier attendees. EventzFlow automates 
						the tedious tasks so you can focus on creating exceptional experiences.
					</motion.p>
				</div>

				<div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
					{valuePropositions.map((value, index) => {
						const Icon = value.icon;
						return (
							<motion.div
								key={value.title}
								className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 sm:rounded-2xl sm:p-8"
								initial={{ opacity: 0, y: 24 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.07 }}
							>
								{/* Gradient overlay on hover */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								
								<div className="relative">
									<div className="mb-4 flex items-start gap-3 sm:mb-6 sm:gap-4">
										<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15 group-hover:ring-primary/30 sm:h-14 sm:w-14 sm:rounded-xl">
											<Icon className="h-6 w-6 sm:h-7 sm:w-7" />
										</div>
										<div className="min-w-0 flex-1">
											<h3 className="text-base font-bold text-card-foreground transition-colors group-hover:text-primary sm:text-lg lg:text-xl">
												{value.title}
											</h3>
											<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
												{value.copy}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap gap-1.5 sm:gap-2">
										{value.pills.map((pill) => (
											<span
												key={pill}
												className="inline-flex items-center rounded-md border border-border bg-secondary/50 px-2 py-1 text-[10px] font-medium text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs"
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
					className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-primary px-5 py-6 text-center text-primary-foreground sm:mt-10 sm:gap-6 sm:rounded-3xl sm:px-8 sm:py-10 lg:mt-12 lg:flex-row lg:justify-between lg:text-left"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 sm:h-12 sm:w-12">
							<Handshake className="h-5 w-5 sm:h-6 sm:w-6" />
						</div>
						<div className="min-w-0">
							<p className="text-base font-semibold sm:text-lg">Quick setup in minutes</p>
							<p className="mt-1 text-xs opacity-90 sm:text-sm">
								Launch your complete event management platform in under 5 minutes with instant WhatsApp integration.
							</p>
						</div>
					</div>
					<div className="flex flex-wrap justify-center gap-2 sm:gap-3">
						<span className="whitespace-nowrap rounded-full border border-primary-foreground/20 px-3 py-1.5 text-[10px] uppercase tracking-widest sm:px-4 sm:py-2 sm:text-xs">
							24/7 Automation
						</span>
						<span className="whitespace-nowrap rounded-full border border-primary-foreground/20 px-3 py-1.5 text-[10px] uppercase tracking-widest sm:px-4 sm:py-2 sm:text-xs">
							Full API Access
						</span>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default JourneySection;
