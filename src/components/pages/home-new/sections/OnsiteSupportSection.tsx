"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const leftFeatures = [
	"WhatsApp registration with automated QR code delivery and reminders",
	"Instant badge printing in under 3 seconds with custom branding",
	"Real-time hall capacity monitoring and crowd control management",
	"Booth visit tracking with heat maps and dwell time analytics",
	"Multi-gate access control for large-scale venues and exhibitions",
];

const rightFeatures = [
	"Self-service registration kiosks for walk-in attendee management",
	"Interactive crowd engagement tools with live polls and gamification",
	"Live analytics dashboard with real-time attendance and engagement metrics",
	"Business matching system connecting exhibitors with qualified prospects",
	"AI-powered audience profiling for targeted post-event retargeting campaigns",
];

const OnsiteSupportSection: React.FC = () => {
	return (
		<section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:py-28">
			{/* Background Image with Overlay */}
			<div className="absolute inset-0">
				<img
					src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=1080&fit=crop"
					alt="Event management background"
					className="h-full w-full object-cover"
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-slate-900/90" />
			</div>

			<div className="relative mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8 flex flex-col gap-4 text-center sm:mb-12 sm:gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:text-left">
					<div>
						<motion.span
							className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400 sm:px-4 sm:py-2 sm:text-xs"
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
						>
							<span className="whitespace-nowrap">Complete Onsite Solution</span>
						</motion.span>
						<motion.h2
							className="mt-3 text-2xl font-semibold text-white sm:mt-4 sm:text-3xl lg:text-4xl"
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: 0.05 }}
						>
							Everything You Need for
							<br />
							<span className="text-emerald-400">Flawless Event Execution</span>
						</motion.h2>
					</div>
					<motion.div
						className="px-2 lg:max-w-xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						<p className="text-sm text-white sm:text-base lg:text-lg">
							From the moment attendees arrive to the final analytics report, EventzFlow handles every aspect 
							of your onsite operations. Our comprehensive platform combines mobile technology, real-time tracking, 
							and intelligent automation to deliver seamless experiences for events of any scale.
						</p>
					</motion.div>
				</div>

				{/* Features Grid */}
				<div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8">
					{/* Left Column */}
					<motion.div
						className="space-y-3 sm:space-y-4"
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						{leftFeatures.map((feature, index) => (
							<motion.div
								key={feature}
								className="flex items-start gap-2.5 sm:gap-3"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 sm:h-6 sm:w-6">
									<Check className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
								</div>
								<p className="text-sm font-medium text-white sm:text-base">{feature}</p>
							</motion.div>
						))}
					</motion.div>

					{/* Right Column */}
					<motion.div
						className="space-y-3 sm:space-y-4"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						{rightFeatures.map((feature, index) => (
							<motion.div
								key={feature}
								className="flex items-start gap-2.5 sm:gap-3"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400/20 sm:h-6 sm:w-6">
									<Check className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
								</div>
								<p className="text-sm font-medium text-white sm:text-base">{feature}</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default OnsiteSupportSection;
