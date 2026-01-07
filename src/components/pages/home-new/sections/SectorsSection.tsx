"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type React from "react";
import { useRef } from "react";

const smoothEase = [0.25, 0.46, 0.45, 0.94];

const sectors = [
	{
		title: "TRADE SHOWS & EXHIBITIONS",
		img: "/images/homepage/TradeShow.png",
	},
	{
		title: "CORPORATE EVENTS",
		img: "/images/homepage/Corporate.png",
	},
	{
		title: "GOVERNMENT",
		img: "/images/homepage/Goverment.png",
	},
	{
		title: "EDUCATION",
		img: "/images/homepage/Education.png",
	},
	{
		title: "NON-PROFITS",
		img: "/images/homepage/NonProfits.png",
	},
	{
		title: "EVENT AGENCIES",
		img: "/images/homepage/EventAgencies.png",
	},
];

const SectorItem: React.FC<{ sector: (typeof sectors)[0]; index: number }> = ({
	sector,
	index,
}) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});

	const x = useTransform(
		scrollYProgress,
		[0, 1],
		index % 2 === 0 ? [-200, 200] : [200, -200]
	);

	return (
		<div
			ref={ref}
			className="group relative flex h-[35vh] w-full items-center justify-center overflow-hidden md:h-[50vh]"
		>
			{/* Background image */}
			<div
				className={`pointer-events-none absolute inset-0 z-0 transition-all duration-500 ease-out ${
					isInView
						? "scale-100 opacity-80 grayscale-0"
						: "scale-110 opacity-40 grayscale"
				}`}
			>
				<Image
					src={sector.img}
					alt={sector.title}
					fill
					sizes="100vw"
					className="object-cover"
					loading={index < 2 ? "eager" : "lazy"}
					priority={index < 2}
					quality={90}
				/>
			</div>

			{/* Dark overlay for text readability */}
			<div
				className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ${
					isInView ? "bg-black/10" : "bg-black/20"
				}`}
			/>

			<motion.h3
				className="pointer-events-none relative z-10 whitespace-nowrap font-black text-5xl tracking-tight md:text-7xl lg:text-8xl"
				style={{ x, color: "rgba(255,255,255,0.3)", WebkitTextStroke: "2px black", textShadow: "4px 4px 0px rgba(0,0,0,0.2)" }}
			>
				{sector.title}
			</motion.h3>
		</div>
	);
};

const SectorsSection: React.FC = () => {
	return (
		<section className="bg-white">
			{/* Header */}
			<div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-16">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: smoothEase }}
				>
					{/* Decorative lines with text */}
					<div className="mb-6 flex items-center justify-center gap-6">
						<div className="h-px w-16 bg-black/30" />
						<span className="text-xs tracking-[0.3em] text-black/50">
							BUILT FOR EVERY SECTOR
						</span>
						<div className="h-px w-16 bg-black/30" />
					</div>

					<h2 className="font-black text-5xl tracking-tighter text-black md:text-6xl lg:text-7xl">
						INDUSTRIES WE SERVE
					</h2>
				</motion.div>
			</div>

			<div className="flex flex-col">
				{sectors.map((sector, i) => (
					<SectorItem key={sector.title} sector={sector} index={i} />
				))}
			</div>
		</section>
	);
};

export default SectorsSection;
