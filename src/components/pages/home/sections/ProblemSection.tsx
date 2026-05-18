"use client";

import { motion } from "framer-motion";
import { FileWarning, Hourglass, Unplug } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useState } from "react";

const problems = [
	{
		id: "01",
		title: "The Queue",
		subtitle: "Registration Friction",
		description:
			"Manual check-ins create bottlenecks. VIPs wait in line. A slow start kills the event experience before it even begins.",
		icon: Hourglass,
		bg: "bg-zinc-100",
		image: "/images/homepage/Problem1.webp",
	},
	{
		id: "02",
		title: "Blind Spots",
		subtitle: "Zero Data Visibility",
		description:
			"You can't manage what you can't measure. Without real-time analytics, you're making high-stakes decisions based on guesses.",
		icon: FileWarning,
		bg: "bg-zinc-200",
		image: "/images/homepage/Problem2.webp",
	},
	{
		id: "03",
		title: "Scattered",
		subtitle: "Operational Silos",
		description:
			"Excel for data. WhatsApp for comms. Disconnected tools lead to manual errors, lost leads, and staff burnout.",
		icon: Unplug,
		bg: "bg-zinc-300",
		image: "/images/homepage/Problem3.webp",
	},
];

const ProblemSection: React.FC = () => {
	const [focused, setFocused] = useState<string | null>(null);

	return (
		<section className="border-black border-b bg-white-background py-12 text-black md:py-20">
			<div className="mx-auto max-w-[1600px] px-4 md:px-8">
				{/* Header - Refined Swiss Layout */}
				<div className="mb-0">
					{/* Headline & Intro Grid */}
					<div className="mb-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
						<div className="lg:col-span-8">
							<h2 className="font-black text-5xl text-black uppercase leading-[0.85] tracking-tighter sm:text-7xl md:text-9xl">
								Event
								<span className="block text-black">Complexity.</span>
							</h2>
						</div>
						<div className="flex flex-col justify-end border-black/10 pb-2 lg:col-span-4 lg:border-l lg:pl-8">
							<p className="font-medium text-black text-lg leading-relaxed md:text-xl">
								Good events are{" "}
								<span className="border-brand-green/50 border-b-2 font-bold text-zinc-900">
									memorable
								</span>
								.
							</p>
							<p className="mt-2 font-bold text-xl text-zinc-900 leading-tight md:text-2xl">
								But, great events are{" "}
								<span className="mt-1 block font-black text-4xl text-brand-green uppercase italic tracking-tighter drop-shadow-sm md:text-5xl">
									unforgettable.
								</span>
							</p>
						</div>
					</div>
				</div>

				{/* The Expanding Grid */}
				<div className="flex flex-col border-black border-t border-l lg:h-[600px] lg:flex-row">
					{problems.map((item) => (
						<motion.div
							key={item.id}
							onMouseEnter={() => setFocused(item.id)}
							onMouseLeave={() => setFocused(null)}
							className={`relative flex cursor-crosshair flex-col justify-between overflow-hidden border-black border-r border-b p-6 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:p-8 lg:flex-col ${focused === item.id ? "lg:flex-[2]" : "lg:flex-[1]"}
                                ${focused && focused !== item.id ? "lg:opacity-50 lg:grayscale" : "opacity-100"}
                                ${item.bg}
                            `}
						>
							{/* Background Image */}
							<div className="pointer-events-none absolute inset-0">
								<Image
									src={item.image}
									alt={item.title}
									fill
									className={`object-cover transition-all duration-700 ${focused === item.id ? "opacity-35 blur-0" : "opacity-20 blur-[1px]"}`}
									sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority={item.id === "01"}
								/>
								{/* Gradient overlay for better text contrast */}
								<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
							</div>

							{/* Top Content */}
							<div className="relative z-10 mb-8 flex items-start justify-between lg:mb-0">
								<span className="flex h-12 w-12 items-center justify-center border border-black bg-white font-bold font-mono text-xl">
									{item.id}
								</span>
								<div className="flex h-12 w-12 items-center justify-center border border-black bg-white">
									<item.icon
										className="h-6 w-6 opacity-100"
										strokeWidth={1.5}
									/>
								</div>
							</div>

							{/* Middle Center: Big Title */}
							<div className="relative z-10 my-auto mb-8 lg:mb-auto">
								<h3 className="mb-2 font-black text-4xl uppercase tracking-tighter sm:text-5xl md:text-6xl">
									{item.title}
								</h3>
								<div className="mb-4 h-1 w-12 bg-black transition-all group-hover:w-24" />
								<span className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
									{item.subtitle}
								</span>
							</div>

							{/* Bottom Content: Description */}
							<div className="relative z-10 mt-auto flex flex-col justify-end">
								<div
									className={`transition-all delay-100 duration-500 lg:min-h-[120px] ${focused === item.id ? "lg:translate-y-0 lg:opacity-100" : "lg:translate-y-4 lg:opacity-0"}translate-y-0 opacity-100`}
								>
									<p className="max-w-md font-medium text-lg leading-tight">
										{item.description}
									</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ProblemSection;
