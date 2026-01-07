"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ServiceHeroProps {
	title: string;
	titleOutline: string;
	tagline: string;
	description: string;
	heroImage?: string;
}

const smoothEase = [0.25, 0.46, 0.45, 0.94];

const ServiceHero: React.FC<ServiceHeroProps> = ({
	title,
	titleOutline,
	tagline,
	description,
	heroImage,
}) => {
	const { scrollY } = useScroll();
	const y1 = useTransform(scrollY, [0, 500], [0, -150]);
	const y2 = useTransform(scrollY, [0, 500], [0, 150]);
	const opacity = useTransform(scrollY, [0, 400], [1, 0]);
	const imageScale = useTransform(scrollY, [0, 500], [1, 1.2]);

	return (
		<section className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-black px-6">
			{/* Background Image */}
			{heroImage && (
				<motion.div
					style={{ scale: imageScale }}
					className="absolute inset-0 z-0"
				>
					<Image
						src={heroImage}
						alt={`${title} ${titleOutline}`}
						fill
						className="object-cover"
						priority
					/>
					{/* Dark overlay for text readability */}
					<div className="absolute inset-0 bg-black/60" />
				</motion.div>
			)}

			{/* Left vertical accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, ease: smoothEase }}
				className="absolute left-6 top-0 z-10 h-[70%] w-[2px] origin-top bg-white md:left-12 lg:left-16"
			/>

			{/* Main Title */}
			<motion.div
				style={{ opacity }}
				className="pointer-events-none z-10 text-center"
			>
				<div className="overflow-hidden">
					<motion.h1
						initial={{ y: 400 }}
						animate={{ y: 0 }}
						transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
						style={{ y: y1 }}
						className="mb-2 font-black text-[15vw] uppercase leading-[0.85] tracking-tighter text-white md:text-[12vw]"
					>
						{title}
					</motion.h1>
				</div>
				<div className="overflow-hidden">
					<motion.h1
						initial={{ y: 400 }}
						animate={{ y: 0 }}
						transition={{
							duration: 1.2,
							delay: 0.1,
							ease: [0.16, 1, 0.3, 1],
						}}
						style={{
							WebkitTextStroke: "2px rgba(255,255,255,0.8)",
							color: "transparent",
							y: y2,
						}}
						className="font-black text-[15vw] uppercase leading-[0.85] tracking-tighter md:text-[12vw]"
					>
						{titleOutline}
					</motion.h1>
				</div>
			</motion.div>

			{/* Bottom Left - Tagline & Description */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1, duration: 0.8 }}
				className="absolute bottom-12 left-6 max-w-md md:bottom-16 md:left-12 lg:left-16"
			>
				<p className="mb-3 font-bold text-[10px] uppercase tracking-[0.3em] text-white/50">
					{tagline}
				</p>
				<p className="text-sm leading-relaxed text-white/60 md:text-base">
					{description}
				</p>
			</motion.div>
		</section>
	);
};

export default ServiceHero;
