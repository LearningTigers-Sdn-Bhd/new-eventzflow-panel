"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import type React from "react";

export const HeroSection: React.FC = () => {
	return (
		<section className="relative overflow-hidden bg-muted pt-24 pb-12 lg:flex lg:min-h-screen lg:items-center">
			<div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
			<div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(var(--primary-rgb),0.05)_0%,_transparent_50%)]" />

			<div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<motion.div
						className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-3 py-1.5 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.25em] backdrop-blur-sm sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
						<span>About Us</span>
					</motion.div>

					<motion.h1
						className="mt-4 px-2 font-bold text-3xl text-foreground leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
					>
						The Future of Event Management
						<span className="mt-2 block bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent sm:mt-3">
							Simple, Powerful, and Intuitive
						</span>
					</motion.h1>

					<motion.p
						className="mx-auto mt-3 max-w-3xl px-4 text-muted-foreground text-sm leading-relaxed sm:mt-5 sm:text-base lg:mt-6 lg:text-lg"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
					>
						At EventzFlow, we're building the next generation of event
						technology. Our mission is to empower organizers with tools that are
						not only powerful but also a joy to use.
					</motion.p>
				</div>

				<motion.div
					className="mx-auto mt-6 max-w-4xl sm:mt-10 lg:mt-16"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
				>
					<div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg transition-transform duration-300 hover:scale-[1.02] sm:rounded-2xl">
						<Image
							src="/images/about/hero-team.png"
							alt="EventzFlow team in a planning session"
							fill
							className="object-cover"
							priority
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1000px"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
					</div>
				</motion.div>
			</div>
		</section>
	);
};
