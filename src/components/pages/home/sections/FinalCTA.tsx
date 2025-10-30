"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Zap, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";

const FinalCTA: React.FC = () => {
	// EventzFlow Brand Colors (matching HeroSection)
	const colors = {
		primary: "#22C55E", // EventzFlow Green
		blue: "#3B82F6", // EventzFlow Blue
		lightGreen: "#4ADE80", // Light Green accent
	};

	return (
		<section className="relative overflow-x-hidden bg-gradient-to-br from-muted to-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
			{/* Background Effects - constrained to viewport */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute top-1/4 left-1/4 h-64 max-h-[40vw] w-64 max-w-[40vw] rounded-full blur-3xl sm:h-96 sm:w-96"
					style={{
						background: `radial-gradient(circle, ${colors.primary}1A 0%, ${colors.blue}1A 100%)`,
					}}
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.5, 0.8, 0.5],
					}}
					transition={{
						duration: 4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute right-1/4 bottom-1/4 h-56 max-h-[35vw] w-56 max-w-[35vw] rounded-full blur-3xl sm:h-80 sm:w-80"
					style={{
						background: `radial-gradient(circle, ${colors.blue}1A 0%, ${colors.lightGreen}1A 100%)`,
					}}
					animate={{
						scale: [1.1, 1, 1.1],
						opacity: [0.8, 0.5, 0.8],
					}}
					transition={{
						duration: 4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
						delay: 1,
					}}
				/>
			</div>

			<div className="relative mx-auto max-w-4xl text-center">
				{/* Stats Row */}
				<motion.div
					className="mb-8 grid grid-cols-3 gap-4 sm:mb-12 sm:gap-6 lg:gap-8"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.2 }}
				>
					{[
						{ value: "10K+", label: "Events Managed" },
						{ value: "2M+", label: "Tickets Sold" },
						{ value: "5 min", label: "Setup Time" },
					].map((stat, index) => (
						<motion.div
							key={index}
							className="text-center"
							initial={{ opacity: 0, y: 20, scale: 0.9 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: false, amount: 0.05 }}
							transition={{
								duration: 0.3,
								delay: 0.03 + index * 0.015,
								type: "spring",
								stiffness: 100,
							}}
							whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
						>
							<motion.div
								className="mb-1 font-bold text-2xl sm:mb-2 sm:text-3xl"
								initial={{ scale: 0 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: false, amount: 0.05 }}
								transition={{
									duration: 0.25,
									delay: 0.05 + index * 0.015,
									type: "spring",
									stiffness: 200,
								}}
							>
								{stat.value}
							</motion.div>
							<div className="text-muted-foreground text-xs sm:text-sm">
								{stat.label}
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Main CTA */}
				<motion.div
					className="mb-8 sm:mb-12"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.3, delay: 0.08 }}
				>
					<motion.h2
						className="mb-4 px-4 font-bold text-2xl leading-tight sm:mb-6 sm:px-0 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						Ready to Get
						<br />
						<motion.span
							className="bg-clip-text text-transparent"
							style={{
								backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`,
							}}
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: false, amount: 0.05 }}
							transition={{ duration: 0.25, delay: 0.13 }}
						>
							Started Today?
						</motion.span>
					</motion.h2>

					<motion.p
						className="mx-auto mb-6 max-w-2xl px-4 text-base text-muted-foreground leading-relaxed sm:mb-8 sm:px-0 sm:text-lg lg:text-xl"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.25, delay: 0.15 }}
					>
						Join 5,000+ successful event organizers using automated WhatsApp
						ticket sales. Launch your complete platform in under 5 minutes.
					</motion.p>

					<motion.div
						className="mb-6 flex flex-col justify-center gap-3 sm:mb-8 sm:flex-row sm:gap-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.25, delay: 0.18 }}
					>
						<motion.div
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
						>
							<Link href={"/auth?mode=login" as Route}>
								<Button size="lg" className="group text-sm sm:text-base">
									<motion.div
										whileHover={{ rotate: 12 }}
										transition={{ duration: 0.15 }}
									>
										<Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
									</motion.div>
									<span>Get Started</span>
									<motion.div
										whileHover={{ x: 5 }}
										transition={{ duration: 0.15 }}
									>
										<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
									</motion.div>
								</Button>
							</Link>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
						>
							<a href="#product-demo">
								<Button
									variant="outline"
									size="lg"
									className="text-sm sm:text-base"
								>
									See Platform Demo
								</Button>
							</a>
						</motion.div>
					</motion.div>
				</motion.div>

				{/* Features Highlight */}
				<motion.div
					className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.15, delay: 0.2 }}
				>
					{[
						{
							icon: Zap,
							title: "5-Minute Setup",
							desc: "Deploy your WhatsApp ticketing bot instantly, no technical skills needed.",
							color: "text-primary",
						},
						{
							icon: Calendar,
							title: "24/7 Automation",
							desc: "Handle ticket sales, payments, and delivery around the clock.",
							color: "text-ring",
						},
						{
							icon: Star,
							title: "99.8% Uptime",
							desc: "Enterprise-grade reliability with military-grade security.",
							color: "text-accent",
						},
					].map((feature, index) => {
						const IconComponent = feature.icon;
						return (
							<motion.div
								key={index}
								className="rounded-lg border bg-background/50 p-4 backdrop-blur-sm sm:rounded-xl sm:p-6"
								initial={{ opacity: 0, y: 20, scale: 0.95 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: false, amount: 0.05 }}
								transition={{
									duration: 0.15,
									delay: 0.23 + index * 0.015,
									type: "spring",
									stiffness: 100,
								}}
								whileHover={{
									scale: 1.05,
									y: -5,
									transition: { duration: 0.2 },
								}}
							>
								<motion.div
									initial={{ scale: 0, rotate: -45 }}
									whileInView={{ scale: 1, rotate: 0 }}
									viewport={{ once: false, amount: 0.05 }}
									transition={{
										duration: 0.25,
										delay: 0.25 + index * 0.03,
										type: "spring",
										stiffness: 200,
									}}
									whileHover={{ rotate: 5, scale: 1.1 }}
								>
									<IconComponent
										className={`h-6 w-6 sm:h-8 sm:w-8 ${feature.color} mx-auto mb-2 sm:mb-3`}
									/>
								</motion.div>
								<motion.h3
									className="mb-1 font-semibold text-sm leading-tight sm:mb-2 sm:text-base"
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									viewport={{ once: false, amount: 0.05 }}
									transition={{ duration: 0.15, delay: 0.3 + index * 0.03 }}
								>
									{feature.title}
								</motion.h3>
								<motion.p
									className="text-muted-foreground text-xs leading-relaxed sm:text-sm"
									initial={{ opacity: 0 }}
									whileInView={{ opacity: 1 }}
									viewport={{ once: false, amount: 0.05 }}
									transition={{ duration: 0.15, delay: 0.33 + index * 0.03 }}
								>
									{feature.desc}
								</motion.p>
							</motion.div>
						);
					})}
				</motion.div>

				{/* Social Proof */}
				<motion.div
					className="text-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.25, delay: 0.4 }}
				>
					<motion.div
						className="mb-2 flex items-center justify-center space-x-1 sm:mb-3"
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.25, delay: 0.45 }}
					>
						{[...Array(5)].map((_, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, scale: 0, rotate: -180 }}
								whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
								viewport={{ once: false, amount: 0.05 }}
								transition={{
									duration: 0.2,
									delay: 0.5 + i * 0.03,
									type: "spring",
									stiffness: 200,
								}}
							>
								<Star className="h-4 w-4 fill-current text-yellow-400 sm:h-5 sm:w-5" />
							</motion.div>
						))}
					</motion.div>
					<motion.p
						className="text-muted-foreground text-xs sm:text-sm"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.15, delay: 0.63 }}
					>
						Trusted by 5,000+ event organizers worldwide
					</motion.p>
				</motion.div>

				{/* Risk-Free Note */}
				<motion.div
					className="mt-6 text-center sm:mt-8"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: false, amount: 0.05 }}
					transition={{ duration: 0.25, delay: 0.65 }}
				>
					<motion.p
						className="px-4 text-muted-foreground text-xs sm:px-0 sm:text-sm"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: false, amount: 0.05 }}
						transition={{ duration: 0.15, delay: 0.68 }}
					>
						✓ Free plan available ✓ No credit card required ✓ Cancel anytime
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
};

export default FinalCTA;
