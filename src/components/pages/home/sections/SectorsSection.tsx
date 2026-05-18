"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type React from "react";
import { useRef } from "react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const sectors = [
	{
		title: "TRADE SHOWS & EXHIBITIONS",
		img: "/images/homepage/TradeShow.webp",
	},
	{
		title: "CORPORATE EVENTS",
		img: "/images/homepage/Corporate.webp",
	},
	{
		title: "GOVERNMENT",
		img: "/images/homepage/Goverment.webp",
	},
	{
		title: "EDUCATION",
		img: "/images/homepage/Education.webp",
	},
	{
		title: "NON-PROFITS",
		img: "/images/homepage/NonProfits.webp",
	},
	{
		title: "EVENT AGENCIES",
		img: "/images/homepage/EventAgencies.webp",
	},
];

const SectorItem: React.FC<{ sector: (typeof sectors)[0]; index: number }> = ({
	sector,
	index,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

	// Use window scroll instead of element-based scroll to avoid the container warning
	const { scrollY } = useScroll();

	const x = useTransform(scrollY, (value) => {
		if (!ref.current) return 0;
		const rect = ref.current.getBoundingClientRect();
		const elementCenter = rect.top + rect.height / 2;
		const viewportCenter = window.innerHeight / 2;
		const distance = (elementCenter - viewportCenter) / window.innerHeight;
		const offset = distance * 200;
		return index % 2 === 0 ? -offset : offset;
	});

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
					quality={75}
				/>
			</div>

			{/* Dark overlay for text readability */}
			<div
				className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-500 ${
					isInView ? "bg-black/25" : "bg-black/35"
				}`}
			/>

			<motion.h3
				className="pointer-events-none relative z-10 whitespace-nowrap font-black text-4xl tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
				style={{
					x,
					color: isInView ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)",
					WebkitTextStroke: isInView
						? "2px rgba(0,0,0,0.9)"
						: "2px rgba(0,0,0,0.75)",
					textShadow: isInView
						? "0 14px 40px rgba(0,0,0,0.65), 4px 4px 0 rgba(0,0,0,0.3)"
						: "0 10px 30px rgba(0,0,0,0.55), 3px 3px 0 rgba(0,0,0,0.25)",
				}}
			>
				{sector.title}
			</motion.h3>
		</div>
	);
};

const SectorsSection: React.FC = () => {
	return (
		<section id="industries" className="relative bg-white">
			{/* Header */}
			<div className="mx-auto max-w-7xl px-6 py-12 text-center md:py-20 lg:px-16">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				>
					{/* Decorative lines with text */}
					<div className="mb-4 flex items-center justify-center gap-4 md:mb-6 md:gap-6">
						<div className="h-px w-8 bg-black/30 md:w-16" />
						<span className="text-black/60 text-xs tracking-[0.2em] sm:text-sm sm:tracking-[0.3em]">
							BUILT FOR EVERY SECTOR
						</span>
						<div className="h-px w-8 bg-black/30 md:w-16" />
					</div>

					<h2 className="font-black text-3xl text-black tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
						INDUSTRIES WE SERVE
					</h2>
				</motion.div>
			</div>

			<div className="relative flex flex-col">
				{sectors.map((sector, i) => (
					<SectorItem key={sector.title} sector={sector} index={i} />
				))}
			</div>
		</section>
	);
};

export default SectorsSection;
