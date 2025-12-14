"use client";

import { motion } from "framer-motion";
import {
	Briefcase,
	Building2,
	CheckCircle,
	GraduationCap,
	Handshake,
	Sparkles,
	Users,
} from "lucide-react";
import type React from "react";

const audienceList = [
	{
		icon: Users,
		title: "Event Planning & Marketing Agencies",
		descriptions: [
			"Bring your creative vision to life with powerful tools that simplify planning and keep every detail on track.",
			"Collaborate effortlessly with your team, clients, and vendors—all in one place, so nothing falls through the cracks.",
			"Deliver fully branded experiences with white-label solutions that make every event unmistakably yours.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
	},
	{
		icon: Building2,
		title: "Corporate & Enterprise Teams",
		descriptions: [
			"Create polished, professional experiences for conferences, product launches, and company gatherings that leave lasting impressions.",
			"Understand what resonates with your audience through detailed insights and engagement metrics that prove your event's impact.",
			"Work seamlessly with the tools your team already uses—no complicated setup, just smooth connections.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
	},
	{
		icon: Briefcase,
		title: "Government & Public Services",
		descriptions: [
			"Deliver secure, transparent events that meet the highest standards for public sector gatherings and official ceremonies.",
			"Welcome diverse communities with multi-language support that ensures everyone feels included and informed.",
			"Maintain complete records and reporting that give you confidence in every decision and outcome.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=400&h=300&fit=crop",
	},
	{
		icon: GraduationCap,
		title: "Universities & Education Partners",
		descriptions: [
			"Keep campus events running smoothly with simple attendance tracking and event coordination that saves valuable time.",
			"Empower students and faculty with easy access to sessions, workshops, and resources—all organized in one platform.",
			"Stay connected with your community through automated updates and communication tools that keep everyone informed.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop",
	},
	{
		icon: Handshake,
		title: "Associations & Non-Profits",
		descriptions: [
			"Maximize your budget with affordable solutions designed specifically for member gatherings and fundraising success.",
			"Strengthen your mission with tools that help coordinate volunteers, track contributions, and celebrate every milestone.",
			"Build deeper connections with your community through insights that show you what matters most to your members.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop",
	},
	{
		icon: Sparkles,
		title: "Conference & Exhibition Organizers",
		descriptions: [
			"Welcome attendees with smooth registration and check-in experiences that set the tone for an exceptional event.",
			"Give exhibitors the spotlight they deserve with organized booth management and floor plans that maximize visibility.",
			"Turn conversations into opportunities with powerful lead capture tools that help exhibitors connect and grow their business.",
		],
		imageUrl:
			"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
	},
];

const TargetAudienceSection: React.FC = () => {
	// Duplicate the array for infinite loop effect
	const duplicatedAudiences = [...audienceList, ...audienceList];

	// Card width + gap = 384px + 24px = 408px
	const cardWidth = 408;

	return (
		<section
			id="industries"
			className="relative overflow-hidden bg-muted/40 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
		>
			<div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-primary/10 via-transparent to-transparent blur-3xl" />
			<div className="pointer-events-none absolute top-1/4 right-[-15%] h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

			<div className="relative mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8 flex flex-col items-center text-center sm:mb-12 lg:mb-16">
					<motion.span
						className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 font-semibold text-[10px] text-accent-foreground uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4 }}
					>
						<Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span className="whitespace-nowrap">Trusted Across Industries</span>
					</motion.span>

					<motion.h2
						className="mt-4 font-semibold text-2xl text-foreground sm:mt-6 sm:text-3xl lg:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.05 }}
					>
						Powering Events for Organizations
						<br />
						That Demand Excellence
					</motion.h2>

					<motion.p
						className="mt-3 max-w-5xl px-2 text-muted-foreground text-sm sm:mt-4 sm:text-base lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						From global corporations to government agencies, EventzFlow delivers
						enterprise-grade event technology that adapts to your unique
						workflows—whether you're managing intimate executive briefings or
						international conferences with thousands of attendees.
					</motion.p>
				</div>

				{/* Infinite Ticker Carousel */}
				<div className="-mx-4 relative sm:mx-0">
					<motion.div
						className="flex gap-4 pl-4 sm:gap-6 sm:pl-0"
						animate={{
							x: [0, -(cardWidth * audienceList.length)],
						}}
						transition={{
							x: {
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "loop",
								duration: 40,
								ease: "linear",
							},
						}}
					>
						{duplicatedAudiences.map((audience, index) => {
							const Icon = audience.icon;
							return (
								<motion.div
									key={`${audience.title}-${index}`}
									className="group hover:-translate-y-2 w-80 flex-shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-md backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20 hover:shadow-xl sm:w-96 sm:rounded-2xl"
									initial={{ opacity: 0, y: 50 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										duration: 0.5,
										delay: (index % audienceList.length) * 0.1,
									}}
								>
									{/* Card Image */}
									<div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 sm:h-52">
										<img
											src={audience.imageUrl}
											alt={audience.title}
											className="h-full w-full object-cover"
											loading="lazy"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

										{/* Floating Icon Badge */}
										<div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 sm:bottom-4 sm:left-4 sm:h-12 sm:w-12 sm:rounded-xl">
											<Icon className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
										</div>
									</div>

									{/* Card Content */}
									<div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
										{/* Title Section */}
										<div>
											<h3 className="font-bold text-base text-foreground leading-tight sm:text-lg lg:text-xl">
												{audience.title}
											</h3>
										</div>

										{/* Descriptions with Visual Separators */}
										<div className="space-y-3 sm:space-y-4">
											{audience.descriptions.map((description, idx) => (
												<div
													key={idx}
													className="group/item flex gap-2 sm:gap-3"
												>
													<div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60 transition-colors group-hover/item:bg-primary sm:mt-2 sm:h-2 sm:w-2" />
													<p className="flex-1 text-muted-foreground text-xs leading-relaxed transition-colors group-hover/item:text-foreground sm:text-sm">
														{description}
													</p>
												</div>
											))}
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default TargetAudienceSection;
