"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Cpu, Heart, Users } from "lucide-react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

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
		icon: Cpu,
		title: "Technology meets hospitality",
		description:
			"Great events blend seamless operations with genuine human connection. Our platform handles the complexity so you can focus on creating memorable experiences.",
	},
];

const storyMilestones = [
	{
		phase: "01",
		title: "The Spark",
		description:
			"We saw event organizers struggling with disconnected tools, manual processes, and frustrated attendees. We knew technology could solve these problems elegantly.",
		impact: "Identified the core problems worth solving",
	},
	{
		phase: "02",
		title: "Building the Foundation",
		description:
			"We integrated our Sales Chatalyst technology for WhatsApp automation and built core features: lightning-fast check-ins, badge printing, and real-time analytics.",
		impact: "Created a unified platform from the ground up",
	},
	{
		phase: "03",
		title: "Launch & Learn",
		description:
			"EventzFlow is now live and helping organizers across Asia-Pacific. Every event teaches us something new, and we're constantly refining the experience.",
		impact: "Learning and improving with every event",
	},
];

export default function StorySection() {
	return (
		<section className="border border-black bg-white-background px-6 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="mb-16 max-w-3xl"
				>
					<div className="mb-6 flex items-center gap-4">
						<div className="h-[2px] w-10 bg-black" />
						<p className="font-bold text-black text-xs uppercase tracking-[0.4em]">
							Our Story
						</p>
					</div>
					<h2 className="mb-6 font-black text-3xl text-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
						Why we created EventzFlow
					</h2>
					<p className="text-black/70 text-lg leading-relaxed md:text-xl">
						We built EventzFlow to solve a problem we saw happening everywhere:
						talented event organizers wasting hours on manual tasks, juggling
						disconnected tools, and unable to deliver the seamless experiences
						they envisioned.
					</p>
				</motion.div>

				{/* Mission Pillars */}
				<div className="mb-16 grid md:grid-cols-3">
					{missionPillars.map((pillar) => {
						const IconComponent = pillar.icon;
						return (
							<motion.div
								key={pillar.title}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.6,
									ease: SMOOTH_EASE,
								}}
								whileHover={{ y: -8 }}
								className="group border border-black/30 bg-white p-8 transition-all duration-300 hover:border-black hover:shadow-2xl"
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center border border-black/30 text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
									<IconComponent className="h-5 w-5" />
								</div>
								<h3 className="mb-3 font-bold text-black text-lg">
									{pillar.title}
								</h3>
								<p className="text-base text-black/70 md:text-lg">
									{pillar.description}
								</p>
							</motion.div>
						);
					})}
				</div>

				{/* Journey Timeline */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="border border-black bg-green-background p-8 md:p-12"
				>
					<h3 className="mb-8 font-bold text-2xl text-black uppercase tracking-tight">
						How We Got Here
					</h3>
					<div className="grid gap-6 md:grid-cols-3">
						{storyMilestones.map((milestone) => (
							<motion.div
								key={milestone.phase}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									ease: SMOOTH_EASE,
								}}
								className="border border-black bg-white p-6"
							>
								<span className="font-bold text-brand-green text-xs">
									Phase {milestone.phase}
								</span>
								<h4 className="mt-2 mb-3 font-bold text-black text-lg">
									{milestone.title}
								</h4>
								<p className="mb-4 text-base text-black/70 leading-relaxed md:text-lg">
									{milestone.description}
								</p>
								<div className="flex items-start gap-2 border-black border-t pt-4">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
									<span className="text-black/50 text-sm md:text-base">
										{milestone.impact}
									</span>
								</div>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
