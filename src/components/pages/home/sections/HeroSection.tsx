"use client";

import { motion } from "framer-motion";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const HeroSection: React.FC = () => {
	return (
		<section className="relative min-h-screen overflow-hidden bg-black">
			{/* Full-screen background image */}
			<div className="absolute inset-0">
				<Image
					src="/images/homepage/HeroSection.webp"
					alt="Event management platform"
					fill
					priority
					sizes="100vw"
					className="object-cover opacity-60"
				/>
				{/* Dark overlay for text readability */}
				<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
			</div>

			{/* Left vertical accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, ease: SMOOTH_EASE }}
				className="absolute left-6 top-0 hidden h-[70%] w-[3px] origin-top bg-brand-green md:block md:left-12 lg:left-16"
			/>

			{/* Main content */}
			<div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-32 lg:px-16">
				<div className="grid grid-cols-12 gap-4">
					{/* Left content */}
					<div className="col-span-12 lg:col-span-7">
						{/* Eyebrow */}
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, ease: SMOOTH_EASE }}
							className="mb-8 pl-2 text-xs font-medium uppercase tracking-[0.4em] text-white/70 sm:text-sm"
						>
							All-in-One Event Solution
						</motion.p>

						{/* Main headlines */}
						<div className="space-y-0">
							<motion.h1
								initial={{ opacity: 0, y: 40 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 1, delay: 0.2, ease: SMOOTH_EASE }}
								className="font-bold text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em] text-white"
								style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
							>
								END-TO-END,
								<br />
								<span className="text-brand-green">
									SMART
								</span>
								<br />
								EVENT SOLUTIONS
							</motion.h1>
						</div>
					</div>

					{/* Right content - Description */}
					<div className="col-span-12 mt-16 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.7, ease: SMOOTH_EASE }}
						>
							{/* Horizontal line */}
							<div className="mb-6 h-px w-full bg-brand-green" />

							{/* Description text */}
							<p className="text-left text-base leading-relaxed text-white/80 md:text-right lg:text-lg">
								From visitor booth tracking and QR check-in with instant badge
								printing, to real-time analytics and seamless exhibitor management
								— EventzFlow connects every part of your event journey.
							</p>

							{/* CTA */}
							<div className="mt-8 flex items-center justify-start gap-6 md:justify-end">
								<Link
									href={"/auth?login" as Route}
									className="inline-block bg-brand-green px-10 py-5 text-base font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-brand-green-dark hover:scale-[1.03]"
								>
									Get Started
								</Link>
								<div className="h-px w-16 bg-white/50" />
							</div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* Bottom right accent line */}
			<motion.div
				initial={{ scaleY: 0 }}
				animate={{ scaleY: 1 }}
				transition={{ duration: 1.5, delay: 0.3, ease: SMOOTH_EASE }}
				className="absolute bottom-0 right-[15%] hidden h-[40%] w-px origin-bottom bg-white/20 lg:block"
			/>

			{/* Scroll hint */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.5 }}
				className="absolute bottom-12 left-1/2 -translate-x-1/2"
			>
				<span className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
					Scroll to explore
				</span>
			</motion.div>
		</section>
	);
};

export default HeroSection;
