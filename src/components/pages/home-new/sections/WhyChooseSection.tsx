"use client";

import { motion } from "framer-motion";
import type React from "react";

const benefits = [
	{
		title: "60% COST SAVINGS",
		description:
			"Cut staff requirements and printing costs with intelligent automation. Deliver exceptional events at a fraction of traditional costs.",
	},
	{
		title: "10X FASTER LAUNCH",
		description:
			"Go from concept to live event in minutes. Pre-built templates and zero-code setup get you running instantly.",
	},
	{
		title: "MAXIMUM ENGAGEMENT",
		description:
			"Transform passive attendees into active participants. Boost participation rates by up to 250% with interactive tools.",
	},
	{
		title: "LEADS TO REVENUE",
		description:
			"Turn attendance into business growth. AI-powered insights help identify high-intent prospects and nurture conversions.",
	},
];

const WhyChooseSection: React.FC = () => {
	return (
		<section className="bg-black px-6 py-30 md:px-12">
			<div className="mx-auto max-w-7xl">
				<div className="mb-24 flex items-end justify-between">
					<div className="max-w-2xl">
						<h2 className="mb-8 font-black text-6xl tracking-tighter text-white md:text-8xl">
							WHY
							<br />
							CHOOSE US ?
						</h2>
						<p className="text-xl text-white/60">
							Less manual work. Lower costs. Happier attendees. EventzFlow
							automates the tedious tasks so you can focus on creating
							exceptional experiences.
						</p>
					</div>
					<div className="hidden border-b border-white/40 pb-2 font-bold text-xs tracking-widest text-white/40 md:block">
						01 — 04 / BENEFITS
					</div>
				</div>

				<div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
					{benefits.map((benefit, i) => {
						const isWhiteCard = i % 2 === 1;
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{
									y: -16,
									scale: 1.03,
									transition: { duration: 0.3, ease: "easeOut" },
								}}
								viewport={{ once: true }}
								transition={{
									duration: 0.8,
									delay: i * 0.1,
									ease: [0.16, 1, 0.3, 1],
								}}
								className={`group relative flex h-[450px] flex-col justify-between overflow-hidden border p-10 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl ${
									isWhiteCard
										? "border-black/20 bg-white hover:border-black"
										: "border-white/20 bg-black hover:border-white"
								}`}
							>
								<div className="relative z-10">
									<span
										className={`font-bold text-xs tracking-widest ${
											isWhiteCard ? "text-black/40" : "text-white/40"
										}`}
									>
										0{i + 1}
									</span>
									<h3 className="mt-8 font-black text-3xl leading-none tracking-tighter">
										{benefit.title.split(" ").map((word, idx) => (
											<span
												key={idx}
												className={`block ${isWhiteCard ? "text-black" : "text-white"}`}
											>
												{word}
											</span>
										))}
									</h3>
								</div>
								<p
									className={`relative z-10 text-sm leading-relaxed ${
										isWhiteCard ? "text-black/60" : "text-white/60"
									}`}
								>
									{benefit.description}
								</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default WhyChooseSection;
