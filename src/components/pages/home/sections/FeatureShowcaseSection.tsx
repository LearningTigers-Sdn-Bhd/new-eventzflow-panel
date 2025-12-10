"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
	BarChart3,
	MapPin,
	QrCode,
	CheckCircle2,
	TrendingUp,
	Users,
	Clock,
	Target,
	Handshake,
	LayoutDashboard,
	Zap,
	Sparkles,
} from "lucide-react";

const features = [
	{
		icon: QrCode,
		badge: "Lightning-Fast Check-In",
		title: "Event Ticketing & Registration",
		subtitle: "From online registration to instant badge printing in under 3 seconds",
		description:
			"Branded registration pages with WhatsApp automation, instant payments, and automatic QR code delivery.",
		benefits: [
			{
				icon: CheckCircle2,
				text: "Eliminate queues with rapid QR validation",
			},
			{
				icon: CheckCircle2,
				text: "WhatsApp automation for reminders & updates",
			},
			{
				icon: CheckCircle2,
				text: "Multi-tier ticketing with custom bundles",
			},
			{
				icon: CheckCircle2,
				text: "Real-time capacity monitoring & analytics",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop",
		imageAlt: "Event registration and check-in system",
	},
	{
		icon: MapPin,
		badge: "Visitor Intelligence",
		title: "Booth Tracking & Heat Maps",
		subtitle:
			"Turn visitor movement into actionable insights with real-time analytics",
		description:
			"Track booth visits, dwell times, and engagement patterns with dynamic heat maps for data-driven insights.",
		benefits: [
			{
				icon: Target,
				text: "Track every booth visit with dwell time analytics",
			},
			{
				icon: TrendingUp,
				text: "Heat maps reveal high-traffic & popular zones",
			},
			{
				icon: Users,
				text: "Measure exhibitor ROI with engagement data",
			},
			{
				icon: BarChart3,
				text: "Export detailed reports for stakeholders",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=600&fit=crop",
		imageAlt: "Exhibition hall with booth tracking visualization",
	},
	{
		icon: BarChart3,
		badge: "AI-Powered Marketing",
		title: "Audience Profiling & Retargeting",
		subtitle: "Convert event attendance into qualified leads and future sales",
		description:
			"AI segments attendees by behavior and launches personalized WhatsApp and email campaigns automatically.",
		benefits: [
			{
				icon: Target,
				text: "AI segments by behavior & interests",
			},
			{
				icon: TrendingUp,
				text: "Identify high-intent prospects",
			},
			{
				icon: CheckCircle2,
				text: "WhatsApp & email retargeting",
			},
			{
				icon: Users,
				text: "Automated follow-up campaigns",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
		imageAlt: "Analytics dashboard showing audience insights",
	},
	{
		icon: Users,
		badge: "Engagement Amplifier",
		title: "Interactive Crowd Engagement",
		subtitle: "Boost participation with gamification and real-time interactions",
		description:
			"Live polls, gamification, and personalized notifications keep attendees engaged throughout your event.",
		benefits: [
			{
				icon: Zap,
				text: "Gamification with leaderboards & rewards",
			},
			{
				icon: Users,
				text: "Live polls & Q&A sessions",
			},
			{
				icon: CheckCircle2,
				text: "Push notifications & real-time alerts",
			},
			{
				icon: Target,
				text: "Personalized content delivery",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
		imageAlt: "Engaged audience at event",
	},
	{
		icon: Handshake,
		badge: "Smart Networking",
		title: "Business Matching & Appointments",
		subtitle: "Connect exhibitors with qualified prospects automatically",
		description:
			"AI-powered matching connects the right people with pre-scheduled appointments and calendar integration.",
		benefits: [
			{
				icon: Target,
				text: "AI-powered prospect matching",
			},
			{
				icon: CheckCircle2,
				text: "Pre-scheduled appointments & meetings",
			},
			{
				icon: Clock,
				text: "Automated reminders & confirmations",
			},
			{
				icon: Users,
				text: "Seamless calendar integration",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop",
		imageAlt: "Business networking at event",
	},
	{
		icon: LayoutDashboard,
		badge: "Command Center",
		title: "End-to-End Dashboard",
		subtitle: "Monitor your entire event from a single control center",
		description:
			"Real-time attendance, capacity tracking, and comprehensive analytics with instant data export capabilities.",
		benefits: [
			{
				icon: BarChart3,
				text: "Live attendance & capacity tracking",
			},
			{
				icon: TrendingUp,
				text: "Comprehensive event analytics",
			},
			{
				icon: CheckCircle2,
				text: "Export reports & data instantly",
			},
			{
				icon: Users,
				text: "Real-time insights for all stakeholders",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
		imageAlt: "Event management dashboard",
	},
];

const FeatureShowcaseSection: React.FC = () => {
	return (
		<section id="features" className="bg-background px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<div className="mb-8 text-center sm:mb-12 lg:mb-16">
					<motion.span
						className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 font-medium text-[10px] text-accent-foreground uppercase tracking-[0.2em] sm:mb-3 sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span className="whitespace-nowrap">Powerful Features That Drive Results</span>
					</motion.span>
					<motion.h2
						className="font-semibold text-2xl text-foreground sm:text-3xl lg:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.05 }}
					>
						The Complete Event Management Platform
						<br />
						That Scales With Your Ambitions
					</motion.h2>
					<motion.p
						className="mx-auto mt-3 max-w-3xl px-2 text-muted-foreground text-sm sm:mt-4 sm:text-base lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.08 }}
					>
						From Fortune 500 conferences to government summits, EventzFlow empowers the world's leading organizations 
						to deliver flawless events with intelligent automation, real-time analytics, and AI-powered insights 
						that turn attendees into lasting business relationships.
					</motion.p>
				</div>

				{/* Feature Cards - 3 Per Row Grid with Images */}
				<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => {
						const Icon = feature.icon;

						return (
							<motion.div
								key={feature.title}
								className="group hover:-translate-y-1 relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-50px" }}
								transition={{ duration: 0.4, delay: index * 0.05 }}
							>
								{/* Gradient overlay on hover */}
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

								<div className="relative flex h-full flex-col">
									{/* Image */}
									<div className="relative aspect-[3/2] overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
										<img
											src={feature.imageUrl}
											alt={feature.imageAlt}
											className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										{/* Badge on Image */}
										<div className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/95 px-2 py-1 backdrop-blur-sm sm:top-3 sm:left-3 sm:gap-2 sm:px-2.5 sm:py-1.5">
											<Icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" strokeWidth={2} />
											<span className="font-semibold text-[10px] text-primary sm:text-xs">
												{feature.badge}
											</span>
										</div>
									</div>

								{/* Content */}
								<div className="flex flex-1 flex-col p-4 sm:p-5">
									{/* Title */}
									<h3 className="mb-1.5 font-bold text-base text-foreground transition-colors group-hover:text-primary sm:mb-2 sm:text-lg">
										{feature.title}
									</h3>

									{/* Subtitle */}
									<p className="mb-2 font-medium text-muted-foreground text-xs sm:mb-3 sm:text-sm">
										{feature.subtitle}
									</p>

								{/* Description */}
								<p className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-2 text-foreground/80 text-xs leading-relaxed sm:mb-4 sm:text-sm">
									{feature.description}
								</p>

									{/* Benefits - Push to bottom */}
									<ul className="mt-auto space-y-2 sm:space-y-2.5">
										{feature.benefits.map((benefit, idx) => {
											const BenefitIcon = benefit.icon;
											return (
												<li
													key={idx}
													className="flex items-start gap-2 text-xs sm:gap-2.5 sm:text-sm"
												>
													<BenefitIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4" />
													<span className="text-muted-foreground leading-relaxed">
														{benefit.text}
													</span>
												</li>
											);
										})}
									</ul>
								</div>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default FeatureShowcaseSection;

