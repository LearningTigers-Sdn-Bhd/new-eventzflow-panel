"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const testimonials = [
	{
		id: "01",
		quote:
			"EventzFlow is the operating system for modern events. We reduced check-in time by 75% instantly.",
		name: "SARAH RAHMAN",
		role: "DIRECTOR / TECHWEEK MY",
		metric: "75% FASTER",
		color: "bg-brand-green",
	},
	{
		id: "02",
		quote:
			"The analytics are lethal. We knew exactly where to move our staff before the crowds even formed.",
		name: "DR. LINA TAN",
		role: "HEAD OF OPS / EXPO ASIA",
		metric: "REAL-TIME DATA",
		color: "bg-brand-blue",
	},
	{
		id: "03",
		quote:
			"Reliability was our only KPI. EventzFlow delivered zero downtime across 3 days of heavy traffic.",
		name: "ARUN KRISHNAN",
		role: "CEO / EVENTPRO SOLUTIONS",
		metric: "99.99% UPTIME",
		color: "bg-brand-green",
	},
];

const TestimonialSection: React.FC = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = () => {
		setCurrentIndex((prev) => (prev + 1) % testimonials.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prev) => (prev - 1 + testimonials.length) % testimonials.length,
		);
	};

	return (
		<section className="bg-green-background px-4 py-16 text-black md:py-24 md:px-8 border border-black">
			<div className="mx-auto max-w-[1400px]">
				{/* Top Header */}
				<div className="mb-10 md:mb-20">
					<div className="mb-4 flex items-center gap-3 md:mb-6 md:gap-4">
						<div className="h-[2px] w-6 bg-black md:w-8" />
						<span className="font-bold font-mono text-[10px] text-black/60 uppercase tracking-[0.2em] md:text-xs md:tracking-[0.3em]">
							What Our Clients Say
						</span>
					</div>
					<h2 className="font-black text-4xl uppercase leading-none tracking-tighter sm:text-6xl md:text-8xl lg:text-9xl">
						Testimonials
					</h2>
				</div>

				{/* Split Layout Container */}
				<div className="flex min-h-[auto] flex-col border border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_rgba(0,0,0,1)] lg:min-h-[550px] lg:flex-row">
					{/* LEFT: Dynamic Color Block (The Quote) */}
					<div
						className={`relative flex min-h-[250px] flex-1 flex-col justify-center overflow-hidden border-black border-b p-5 transition-colors duration-500 sm:min-h-[300px] sm:p-6 md:p-16 lg:border-r lg:border-b-0 ${testimonials[currentIndex].color}`}
					>
						<AnimatePresence mode="wait">
							<motion.div
								key={currentIndex}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
								className="relative z-10"
							>
								<span className="mb-[-0.75rem] block select-none font-black text-3xl opacity-20 sm:mb-[-1rem] md:mb-[-1.5rem] md:text-6xl">
									"
								</span>
								<h3 className="font-bold text-xl text-black uppercase leading-[0.95] tracking-tight sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
									{testimonials[currentIndex].quote}
								</h3>
							</motion.div>
						</AnimatePresence>
					</div>

					{/* RIGHT: White Block (The Data & Controls) */}
					<div className="flex flex-col bg-white lg:w-[450px]">
						{/* Author Info Area */}
						<div className="flex flex-1 flex-col justify-between p-5 sm:p-6 md:p-10">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentIndex}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="flex h-full flex-col"
								>
									{/* Name & Role */}
									<div className="mb-auto">
										<div className="mb-1 font-black text-2xl uppercase leading-none tracking-tight sm:text-3xl">
											{testimonials[currentIndex].name}
										</div>
										<div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest sm:text-xs">
											{testimonials[currentIndex].role}
										</div>
									</div>

									{/* Metric Box */}
									<div className="mt-6 border border-black/10 bg-neutral-100 p-4 sm:mt-8 sm:p-6">
										<div className="mb-1.5 font-mono text-[9px] text-neutral-500 uppercase sm:mb-2 sm:text-[10px]">
											Key Impact Metric
										</div>
										<div
											className={`font-black text-2xl uppercase leading-none tracking-tighter sm:text-3xl md:text-4xl ${
												testimonials[currentIndex].color === "bg-brand-blue"
													? "text-brand-blue"
													: "text-brand-green"
											}`}
										>
											{testimonials[currentIndex].metric}
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Inverted Controls */}
						<div className="flex h-16 border-black border-t bg-black text-white sm:h-20">
							<button
								onClick={prevSlide}
								className="group flex flex-1 items-center justify-center border-white/20 border-r transition-colors hover:bg-neutral-800 active:bg-neutral-900"
								aria-label="Previous testimonial"
							>
								<span className="font-mono text-xs tracking-widest transition-transform group-hover:-translate-x-1 sm:text-sm md:text-base">
									← PREV
								</span>
							</button>
							<div
								className={`flex w-20 items-center justify-center border-black border-r border-l font-bold font-mono text-black text-xs sm:w-24 sm:text-sm ${testimonials[currentIndex].color}`}
							>
								{testimonials[currentIndex].id} / 0{testimonials.length}
							</div>
							<button
								onClick={nextSlide}
								className="group flex flex-1 items-center justify-center border-white/20 border-l transition-colors hover:bg-neutral-800 active:bg-neutral-900"
								aria-label="Next testimonial"
							>
								<span className="font-mono text-xs tracking-widest transition-transform group-hover:translate-x-1 sm:text-sm md:text-base">
									NEXT →
								</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default TestimonialSection;
