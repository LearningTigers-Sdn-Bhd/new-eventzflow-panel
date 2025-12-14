"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Quote, Star, Verified } from "lucide-react";
import type React from "react";

const testimonials = [
	{
		name: "Liyana Rahman",
		role: "Head of Events, FutureCity Expo",
		statement:
			"We managed a 12,000-attendee expo seamlessly with EventzFlow. The WhatsApp automation handled registration effortlessly, and the AI-powered retargeting system gave us unprecedented insights that directly increased our exhibitor renewal pipeline by over 20%.",
		metric: "21% uplift in exhibitor rebookings",
		avatar: "https://i.pravatar.cc/150?img=47",
	},
	{
		name: "Jason Lim",
		role: "Director, MyTech Guild Conferences",
		statement:
			"From WhatsApp registration to instant badge printing, EventzFlow made every touchpoint effortless. Our sponsors were blown away by the real-time booth tracking and heat map intelligence—the data quality helped us close two enterprise sponsorship upgrades on-site.",
		metric: "4.8/5 attendee satisfaction score",
		avatar: "https://i.pravatar.cc/150?img=12",
	},
	{
		name: "Priya Anand",
		role: "Experience Lead, Visionary Summit APAC",
		statement:
			"EventzFlow transformed our post-event marketing. The AI-driven audience segmentation and automated follow-up campaigns delivered hyper-personalized content that resonated perfectly with each attendee segment. Our conversion rates improved dramatically.",
		metric: "38% lift in mid-funnel conversions",
		avatar: "https://i.pravatar.cc/150?img=45",
	},
	{
		name: "Mohamad Idris",
		role: "CEO, Nusantara Trade Week",
		statement:
			"The unified dashboard was a game-changer for our operations team. Real-time data across registration, attendance, and booth engagement meant everyone worked from one source of truth. What used to take days of manual reconciliation now happens in hours.",
		metric: "3x faster post-event reconciliation",
		avatar: "https://i.pravatar.cc/150?img=33",
	},
	{
		name: "Chloe Ng",
		role: "Chief of Staff, LaunchLab Festivals",
		statement:
			"EventzFlow's efficiency is remarkable. We launched six branded registration microsites in a single afternoon, and the automated WhatsApp workflows handled attendee inquiries 24/7. Our team finally had time to focus on creating exceptional experiences instead of firefighting logistics.",
		metric: "62% reduction in manual follow-ups",
		avatar: "https://i.pravatar.cc/150?img=44",
	},
	{
		name: "David Tan",
		role: "Operations Director, Tech Summit Asia",
		statement:
			"The live analytics dashboard gave us complete operational visibility we never had before. We monitored check-in flows, hall capacity, and attendee movement in real-time, allowing us to make instant decisions that optimized the entire event experience. The 3-second badge printing eliminated queues completely.",
		metric: "95% check-in accuracy rate",
		avatar: "https://i.pravatar.cc/150?img=56",
	},
];

const ratingStars = Array.from({ length: 5 });

const TestimonialsSection: React.FC = () => {
	return (
		<section
			id="testimonials"
			className="relative overflow-hidden bg-background px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
		>
			<div className="-translate-x-1/2 pointer-events-none absolute top-16 left-1/2 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
			<div className="-bottom-28 pointer-events-none absolute right-12 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
			<div className="-left-24 -translate-y-1/2 pointer-events-none absolute top-2/3 h-72 w-72 rotate-12 rounded-full bg-accent/10 blur-3xl" />

			<div className="relative mx-auto max-w-6xl">
				<div className="mb-8 flex flex-col items-center gap-4 text-center sm:mb-12 sm:gap-6 lg:mb-14">
					<motion.span
						className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 font-semibold text-[10px] text-accent-foreground uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4 }}
					>
						<MessageSquareQuote className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span className="whitespace-nowrap">Client Success Stories</span>
					</motion.span>
					<motion.h2
						className="font-semibold text-2xl text-foreground sm:text-3xl lg:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.05 }}
					>
						Trusted by Event Professionals
						<br />
						Who Demand Results
					</motion.h2>
					<motion.p
						className="max-w-5xl px-2 text-muted-foreground text-sm sm:text-base lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						Don't just take our word for it. See how event organizers across
						Asia-Pacific achieve measurable improvements with EventzFlow's
						intelligent platform.
					</motion.p>
				</div>

				<div className="grid gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
					{testimonials.map((testimonial, index) => {
						return (
							<motion.div
								key={testimonial.name}
								className="group hover:-translate-y-2 relative flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur transition-all duration-500 hover:border-primary/60 hover:shadow-primary/5 hover:shadow-xl sm:gap-6 sm:rounded-3xl sm:p-8"
								initial={{ opacity: 0, y: 32, scale: 0.96 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.6,
									delay: index * 0.12,
									ease: [0.25, 0.1, 0.25, 1],
								}}
							>
								{/* Gradient overlay */}
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-5 sm:rounded-3xl" />

								{/* Quote icon with enhanced styling */}
								<div className="-top-4 sm:-top-6 absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/30 group-hover:shadow-xl sm:right-6 sm:h-12 sm:w-12">
									<Quote className="h-4 w-4 sm:h-5 sm:w-5" />
								</div>

								{/* 5-star rating */}
								<div className="relative flex items-center gap-0.5 sm:gap-1">
									{ratingStars.map((_, starIndex) => (
										<Star
											key={starIndex}
											className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 transition-transform duration-200 group-hover:scale-110 sm:h-4 sm:w-4"
											style={{ transitionDelay: `${starIndex * 50}ms` }}
										/>
									))}
								</div>

								{/* Testimonial text */}
								<p className="relative flex-1 text-card-foreground text-sm leading-relaxed sm:text-base">
									"{testimonial.statement}"
								</p>

								{/* Decorative divider */}
								<div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

								{/* Author info with avatar */}
								<div className="relative flex items-center gap-2.5 sm:gap-3">
									{/* Avatar with image */}
									<div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/40 sm:h-12 sm:w-12">
										<img
											src={testimonial.avatar}
											alt={testimonial.name}
											className="h-full w-full object-cover"
										/>
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1 sm:gap-1.5">
											<p className="truncate font-semibold text-card-foreground text-xs sm:text-sm">
												{testimonial.name}
											</p>
											<Verified className="h-3 w-3 flex-shrink-0 fill-emerald-500 text-emerald-500 sm:h-3.5 sm:w-3.5" />
										</div>
										<p className="truncate text-[10px] text-muted-foreground tracking-wide sm:text-xs">
											{testimonial.role}
										</p>
									</div>
								</div>

								{/* Metric badge - enhanced */}
								<div className="relative inline-flex w-fit items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1.5 font-semibold text-[10px] text-emerald-600 ring-1 ring-emerald-500/20 backdrop-blur transition-all duration-300 group-hover:bg-emerald-500/15 group-hover:ring-emerald-500/30 sm:gap-1.5 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs dark:text-emerald-400">
									<Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-3.5 sm:w-3.5" />
									<span className="whitespace-nowrap">
										{testimonial.metric}
									</span>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default TestimonialsSection;
