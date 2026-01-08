"use client";

import { motion } from "framer-motion";
import type React from "react";

const testimonials = [
	{
		quote:
			"We used to spend hours on manual check-ins. With EventzFlow, our 500-person conference ran smoothly with just 2 staff at the door.",
		name: "SARAH RAHMAN",
		role: "Event Director, TechWeek Malaysia",
	},
	{
		quote:
			"The QR check-in and badge printing saved us so much time. Attendees loved how fast they got through registration.",
		name: "DR. LINA TAN",
		role: "Operations Head, EXPO Asia",
	},
	{
		quote:
			"Finally, real-time data on who's at our event. We can now make decisions on the spot instead of waiting for post-event reports.",
		name: "ARUN KRISHNAN",
		role: "CEO, EventPro Solutions",
	},
];

const TestimonialSection: React.FC = () => {
	return (
		<section
			id="testimonials"
			className="bg-white px-6 py-16 md:py-32 md:px-12"
		>
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-12 md:mb-20">
					<div className="max-w-2xl">
						<div className="mb-4 flex items-center gap-4 md:mb-6">
							<div className="h-[2px] w-8 bg-black" />
							<span className="text-xs tracking-[0.4em] text-black/70 sm:text-sm">
								WHAT OUR CLIENTS SAY
							</span>
						</div>
						<h2 className="font-black text-4xl tracking-tighter text-black sm:text-5xl md:text-6xl lg:text-8xl">
							TESTIMONIALS
						</h2>
					</div>
				</div>

				{/* Testimonials Grid */}
				<div className="grid grid-cols-1 gap-4 md:gap-1 md:grid-cols-3">
					{testimonials.map((testimonial, i) => {
						const isBlackCard = i % 2 === 1;
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{
									y: -12,
									transition: { duration: 0.3, ease: "easeOut" },
								}}
								viewport={{ once: true }}
								transition={{
									duration: 0.8,
									delay: i * 0.1,
									ease: [0.16, 1, 0.3, 1],
								}}
								className={`group relative flex min-h-[300px] flex-col justify-between border p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl md:min-h-[380px] md:p-10 ${
									isBlackCard
										? "border-white/20 bg-black hover:border-white"
										: "border-black/20 bg-white hover:border-black"
								}`}
							>
								{/* Quote */}
								<div>
									<div className="mb-6">
										<svg
											aria-hidden="true"
											className={`h-10 w-10 ${
												isBlackCard ? "text-white/20" : "text-black/10"
											}`}
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
										</svg>
									</div>
									<p
										className={`text-lg leading-relaxed ${
											isBlackCard ? "text-white/80" : "text-black/80"
										}`}
									>
										{testimonial.quote}
									</p>
								</div>

								{/* Author */}
								<div className="mt-8">
									<div
										className={`mb-4 h-px w-12 ${
											isBlackCard ? "bg-white/30" : "bg-black/20"
										}`}
									/>
									<p
										className={`font-bold text-sm tracking-wide ${
											isBlackCard ? "text-white" : "text-black"
										}`}
									>
										{testimonial.name}
									</p>
									<p
										className={`mt-1 text-sm tracking-wide ${
											isBlackCard ? "text-white/60" : "text-black/60"
										}`}
									>
										{testimonial.role}
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

export default TestimonialSection;
