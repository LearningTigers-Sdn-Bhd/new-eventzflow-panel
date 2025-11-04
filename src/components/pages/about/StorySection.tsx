"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Heart, ScrollText, Sparkles, Users } from "lucide-react";
import type React from "react";

// Simple container animation that fades in children
const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2,
		},
	},
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 },
};

export const StorySection: React.FC = () => {
	const missionPillars = [
		{
			icon: Heart,
			title: "Built from experience",
			description:
				"We've seen the chaos of disjointed event tools, endless spreadsheets, and frustrated attendees. EventzFlow is our answer to these challenges.",
		},
		{
			icon: Users,
			title: "Designed with organizers",
			description:
				"Every feature reflects real conversations with event teams. We're building this alongside the people who will actually use it every day.",
		},
		{
			icon: Sparkles,
			title: "Technology meets hospitality",
			description:
				"Great events blend seamless operations with genuine human connection. Our platform handles the complexity so you can focus on creating memorable experiences.",
		},
	];

	const storyMilestones = [
		{
			year: "Phase 1",
			title: "The spark",
			description:
				"We saw event organizers struggling with disconnected tools, manual processes, and frustrated attendees. We knew technology could solve these problems elegantly.",
			impact: "Identified the core problems worth solving",
		},
		{
			year: "Phase 2",
			title: "Building the foundation",
			description:
				"We integrated our Sales Chatalyst technology for WhatsApp automation and built core features: lightning-fast check-ins, badge printing, and real-time analytics.",
			impact: "Created a unified platform from the ground up",
		},
		{
			year: "Phase 3",
			title: "Launch & learn",
			description:
				"EventzFlow is now live and helping organizers across Asia-Pacific. Every event teaches us something new, and we're constantly refining the experience.",
			impact: "Learning and improving with every event",
		},
	];

	return (
		<section className="py-12 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<motion.div
					className="mb-8 space-y-3 text-center sm:mb-10 sm:space-y-4 lg:mb-12"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.25em] sm:px-4 sm:py-2 sm:text-xs">
						<ScrollText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span>Our Story</span>
					</div>
					<h2 className="px-2 font-bold text-2xl text-foreground sm:text-3xl lg:text-4xl">
						Why we created EventzFlow
					</h2>
					<p className="mx-auto max-w-3xl px-4 text-muted-foreground text-sm leading-relaxed sm:text-base">
						We built EventzFlow to solve a problem we saw happening everywhere:
						talented event organizers wasting hours on manual tasks, juggling
						disconnected tools, and unable to deliver the seamless experiences
						they envisioned. We knew there had to be a better way, so we created
						it.
					</p>
				</motion.div>

				{/* Mission Pillars */}
				<motion.div
					className="mb-8 grid gap-4 sm:mb-10 sm:gap-5 md:grid-cols-3 lg:mb-12"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, amount: 0.2 }}
				>
					{missionPillars.map((pillar) => {
						const Icon = pillar.icon;
						return (
							<motion.div
								key={pillar.title}
								variants={item}
								transition={{ duration: 0.5, ease: "easeOut" }}
								className="hover:-translate-y-1 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:rounded-2xl sm:p-5"
							>
								<div className="mb-2 flex items-center gap-2.5 sm:mb-2.5 sm:gap-3">
									<div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 transition-colors duration-300 hover:bg-primary/20 sm:p-2.5">
										<Icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
									</div>
									<h3 className="font-semibold text-foreground text-sm sm:text-base">
										{pillar.title}
									</h3>
								</div>
								<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
									{pillar.description}
								</p>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Journey Cards - Compact Horizontal */}
				<motion.div
					className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-background p-5 sm:rounded-3xl sm:p-6 lg:p-8"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<div className="mb-5 text-center sm:mb-6">
						<h3 className="mb-1.5 font-bold text-foreground text-lg sm:mb-2 sm:text-xl lg:text-2xl">
							How we got here
						</h3>
						<p className="px-2 text-muted-foreground text-xs sm:text-sm">
							From concept to launch, our journey in three phases
						</p>
					</div>

					<motion.div
						className="grid gap-4 sm:gap-5 md:grid-cols-3"
						variants={container}
						initial="hidden"
						whileInView="show"
						viewport={{ once: true, amount: 0.1 }}
					>
						{storyMilestones.map((milestone) => (
							<motion.div
								key={milestone.year}
								variants={item}
								transition={{ duration: 0.5, ease: "easeOut" }}
								className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg sm:rounded-2xl sm:p-5"
							>
								<div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 sm:mb-2.5">
									<span className="font-semibold text-primary text-xs">
										{milestone.year}
									</span>
								</div>

								<h4 className="mb-1.5 font-semibold text-foreground text-sm sm:mb-2 sm:text-base">
									{milestone.title}
								</h4>
								<p className="mb-2.5 text-muted-foreground text-xs leading-relaxed sm:mb-3 sm:text-sm">
									{milestone.description}
								</p>

								<div className="flex items-start gap-2 border-border/50 border-t pt-2 sm:pt-2.5">
									<CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4" />
									<span className="text-muted-foreground text-xs">
										{milestone.impact}
									</span>
								</div>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};
