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
		<section className="border-black border-y bg-white-background px-6 py-16 md:px-12 md:py-30">
			<div className="mx-auto max-w-7xl">
				<div className="mb-12 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
					<div className="max-w-2xl">
						<h2 className="mb-4 font-black text-4xl text-black tracking-tighter sm:text-5xl md:mb-8 md:text-6xl lg:text-8xl">
							WHY
							<br />
							CHOOSE US ?
						</h2>
						<p className="text-black/70 text-lg leading-relaxed md:text-xl">
							Less manual work. Lower costs. Happier attendees. EventzFlow
							automates the tedious tasks so you can focus on creating
							exceptional experiences.
						</p>
					</div>
					<div className="hidden border-black/40 border-b pb-2 font-bold text-black/40 text-sm tracking-widest md:block">
						01 — 04 / BENEFITS
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-1 lg:grid-cols-4">
					{benefits.map((benefit, i) => {
						const isWhiteCard = i % 2 === 1;
						const isBlueCard = i === 2;
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
								className={`group relative flex min-h-[300px] flex-col justify-between overflow-hidden border p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:shadow-2xl md:min-h-[450px] md:p-10 ${
									isWhiteCard
										? "border-black/20 bg-white hover:border-black"
										: isBlueCard
											? "border-black/20 bg-brand-blue hover:border-black"
											: "border-black/20 bg-brand-green hover:border-black"
								}`}
							>
								<div className="relative z-10">
									<span className="font-bold text-black/40 text-xs tracking-widest">
										0{i + 1}
									</span>
									<h3 className="mt-8 font-black text-3xl leading-none tracking-tighter">
										{benefit.title.split(" ").map((word, idx) => (
											<span key={idx} className="block text-black">
												{word}
											</span>
										))}
									</h3>
								</div>
								<p className="relative z-10 text-base text-black/70 leading-relaxed md:text-lg">
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
