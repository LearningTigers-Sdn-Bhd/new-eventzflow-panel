"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Play,
	Sparkles,
	Star,
	Ticket,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
	// Floating particles component with consistent SSR/client rendering
	const FloatingParticles = () => {
		const [isClient, setIsClient] = useState(false);
		const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

		useEffect(() => {
			setIsClient(true);
			// Set actual viewport dimensions after hydration
			if (typeof window !== "undefined") {
				setDimensions({
					width: window.innerWidth,
					height: window.innerHeight,
				});

				const handleResize = () => {
					setDimensions({
						width: window.innerWidth,
						height: window.innerHeight,
					});
				};

				window.addEventListener("resize", handleResize);
				return () => window.removeEventListener("resize", handleResize);
			}
		}, []);

		// Generate consistent seed-based positions to avoid hydration mismatch
		const generateSeededPosition = (seed: number, max: number) => {
			// Simple seeded random function
			const x = Math.sin(seed) * 10000;
			return Math.abs(x - Math.floor(x)) * max;
		};

		// Only render particles after client-side hydration to avoid mismatch
		if (!isClient) {
			return (
				<div className="pointer-events-none absolute inset-0 overflow-hidden" />
			);
		}

		// Increase particle count for wider screens
		const particleCount = Math.min(
			80,
			Math.max(50, Math.floor(dimensions.width / 25)),
		);

		const particles = Array.from({ length: particleCount }, (_, i) => {
			const initialX = generateSeededPosition(i * 2, dimensions.width);
			const initialY = generateSeededPosition(i * 2 + 1, dimensions.height);
			const targetX = generateSeededPosition(i * 3, dimensions.width);
			const targetY = generateSeededPosition(i * 3 + 1, dimensions.height);
			const _duration = 15 + (i % 10); // Consistent duration based on index

			// Alternate between green and blue particles (EventzFlow brand colors)
			const particleColor =
				i % 2 === 0
					? "rgba(34, 197, 94, 0.4)" // EventzFlow Green
					: "rgba(59, 130, 246, 0.3)"; // EventzFlow Blue

			return (
				<motion.div
					key={i}
					className="absolute h-1 w-1 rounded-full"
					style={{ backgroundColor: particleColor }}
					initial={{
						x: initialX,
						y: initialY,
					}}
					animate={{
						x: targetX,
						y: targetY,
					}}
					transition={{
						duration: _duration,
						repeat: Number.POSITIVE_INFINITY,
						repeatType: "reverse",
						ease: "linear",
					}}
				/>
			);
		});

		return (
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				{particles}
			</div>
		);
	};

	// Enhanced animation variants with modern easing and effects
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.04,
				delayChildren: 0.05,
				duration: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: {
			opacity: 0,
			y: 40,
			scale: 0.9,
			filter: "blur(4px)",
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			filter: "blur(0px)",
			transition: {
				duration: 0.4,
				filter: { duration: 0.3 },
			},
		},
	};

	const buttonVariants = {
		hidden: {
			opacity: 0,
			y: 30,
			scale: 0.85,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: 0.4,
				delay: 0.05,
			},
		},
		hover: {
			scale: 1.05,
			y: -2,
			transition: {
				duration: 0.2,
			},
		},
		tap: {
			scale: 0.95,
			y: 0,
		},
	};

	// Color scheme - EventzFlow Brand Colors (works in both light and dark mode)
	const colors = {
		primary: "#22C55E", // EventzFlow Green (matching logo)
		blue: "#3B82F6", // EventzFlow Blue (matching Z in logo)
		lightGreen: "#4ADE80", // Light Green accent
	};

	return (
		<motion.section
			id="hero-section"
			className="relative flex min-h-screen items-center justify-center overflow-x-hidden pb-16 sm:pb-20"
			style={{
				background:
					"linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--muted)), hsl(var(--background)))",
			}}
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			{/* Animated Background Effects */}
			<div className="absolute inset-0 overflow-hidden">
				{/* Static gradient background */}
				<motion.div
					className="absolute inset-0 opacity-30"
					style={{
						background: `radial-gradient(circle at 50% 50%,
              ${colors.primary}26 0%,
              ${colors.blue}1A 25%,
              ${colors.lightGreen}0D 50%,
              transparent 70%)`,
					}}
				/>

				{/* Floating particles */}
				<FloatingParticles />

				{/* Animated grid pattern */}
				<div className="absolute inset-0 opacity-20">
					<motion.div
						className="h-full w-full"
						style={{
							backgroundImage: `
                linear-gradient(${colors.primary}1A 1px, transparent 1px),
                linear-gradient(90deg, ${colors.primary}1A 1px, transparent 1px)
              `,
							backgroundSize: "60px 60px",
						}}
						animate={{
							backgroundPosition: ["0px 0px", "60px 60px"],
						}}
						transition={{
							duration: 10,
							ease: "linear",
							repeat: Number.POSITIVE_INFINITY,
						}}
					/>
				</div>

				{/* Glowing orbs - constrained to viewport */}
				<motion.div
					className="absolute top-1/4 left-1/4 h-48 max-h-[25vw] w-48 max-w-[25vw] rounded-full blur-3xl sm:h-64 sm:w-64"
					style={{
						backgroundColor: `${colors.primary}1A`,
					}}
					animate={{
						scale: [1, 1.2, 1],
						backgroundColor: [
							`${colors.primary}1A`,
							`${colors.primary}26`,
							`${colors.primary}1A`,
						],
					}}
					transition={{
						duration: 4,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute right-1/4 bottom-1/4 h-56 max-h-[30vw] w-56 max-w-[30vw] rounded-full blur-3xl sm:h-80 sm:w-80"
					style={{
						backgroundColor: `${colors.blue}1A`,
					}}
					animate={{
						scale: [1.2, 1, 1.2],
						backgroundColor: [
							`${colors.blue}1A`,
							`${colors.blue}2E`,
							`${colors.blue}1A`,
						],
					}}
					transition={{
						duration: 5,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</div>

			<div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					{/* Enhanced Badge with rating */}
					<motion.div
						className="mb-6 flex justify-center sm:mb-8"
						variants={itemVariants}
					>
						<div
							className="relative inline-flex items-center space-x-2 overflow-hidden rounded-full border px-4 py-2 shadow-2xl backdrop-blur-xl sm:space-x-3 sm:px-6 sm:py-3"
							style={{
								backgroundColor: "hsl(var(--muted) / 0.7)",
								borderColor: "hsl(var(--border))",
							}}
						>
							{/* Shimmer effect */}
							<motion.div
								className="absolute inset-0"
								style={{
									background:
										"linear-gradient(to right, transparent, hsl(var(--foreground) / 0.1), transparent)",
								}}
								animate={{ x: ["-100%", "100%"] }}
								transition={{
									duration: 1.5,
									repeat: Number.POSITIVE_INFINITY,
									ease: "linear",
								}}
							/>

							<motion.div
								animate={{ scale: [1, 1.1, 1] }}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							>
								<Sparkles
									className="h-4 w-4 sm:h-5 sm:w-5"
									style={{ color: colors.lightGreen }}
								/>
							</motion.div>
							<span className="font-semibold text-foreground text-xs tracking-wide sm:text-sm">
								#1 WhatsApp Event Ticketing Platform
							</span>
							<motion.div
								className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
								style={{ backgroundColor: colors.primary }}
								animate={{ opacity: [1, 0.4, 1] }}
								transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
							/>
						</div>
					</motion.div>

					{/* Enhanced Main Title */}
					<motion.div
						className="relative mb-6 px-4 text-center sm:mb-8 sm:px-0"
						variants={itemVariants}
					>
						<h1 className="relative font-black text-2xl leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
							{/* Text glow effect */}
							<div
								className="absolute inset-0 blur-3xl"
								style={{
									background: `linear-gradient(to right, ${colors.primary}33, ${colors.blue}33, ${colors.lightGreen}33)`,
								}}
							/>

							<motion.span
								className="relative z-10 mb-1 block text-foreground drop-shadow-2xl sm:mb-2"
								initial={{
									opacity: 0,
									y: 60,
									scale: 0.8,
									rotateX: 20,
									filter: "blur(8px)",
								}}
								animate={{
									opacity: 1,
									y: 0,
									scale: 1,
									rotateX: 0,
									filter: "blur(0px)",
								}}
								transition={{
									delay: 0.15,
									duration: 0.6,
									type: "spring",
									stiffness: 100,
									filter: { duration: 0.4 },
								}}
							>
								Manage Events and Sell Tickets
							</motion.span>
							<motion.span
								className="relative z-10 block"
								style={{
									background: `linear-gradient(to right, ${colors.primary}, ${colors.blue}, ${colors.lightGreen})`,
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
									backgroundClip: "text",
								}}
								initial={{
									opacity: 0,
									y: 60,
									scale: 0.8,
									rotateX: -20,
									filter: "blur(8px)",
								}}
								animate={{
									opacity: 1,
									y: 0,
									scale: 1,
									rotateX: 0,
									filter: "blur(0px)",
								}}
								transition={{
									delay: 0.25,
									duration: 0.6,
									type: "spring",
									stiffness: 100,
									filter: { duration: 0.4 },
								}}
							>
								Through WhatsApp Automation
							</motion.span>
						</h1>
					</motion.div>

					{/* Subtitle */}
					<motion.div
						className="mb-8 px-4 text-center sm:mb-12 sm:px-0"
						variants={itemVariants}
					>
						<p className="mx-auto max-w-4xl text-base text-muted-foreground leading-relaxed sm:text-lg md:text-xl lg:text-2xl">
							Automated WhatsApp flow that handles{" "}
							<span style={{ color: colors.primary }} className="font-semibold">
								event ticket sales 24/7
							</span>{" "}
							with
							<span style={{ color: colors.blue }} className="font-semibold">
								{" "}
								QR code generation
							</span>{" "}
							and instant ticket delivery to attendees.
						</p>
					</motion.div>

					{/* Enhanced CTA Buttons */}
					<motion.div
						className="mb-12 flex flex-col items-center justify-center gap-3 px-4 sm:mb-16 sm:flex-row sm:gap-4 sm:px-0"
						variants={itemVariants}
					>
						<motion.div
							variants={buttonVariants}
							whileHover="hover"
							whileTap="tap"
						>
							<Link href={"/auth?mode=login" as Route}>
								<Button
									size="lg"
									className="group relative w-full overflow-hidden text-sm text-white shadow-2xl sm:w-auto sm:text-base md:text-lg"
									style={{
										background: `linear-gradient(135deg, ${colors.primary}, ${colors.blue})`,
										border: "none",
									}}
								>
									{/* Enhanced button effects */}
									<motion.div
										className="absolute inset-0"
										style={{
											background: `linear-gradient(to right, ${colors.primary}33, ${colors.blue}33)`,
										}}
										initial={{ opacity: 0 }}
										whileHover={{ opacity: 1 }}
										transition={{ duration: 0.5 }}
									/>
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
										initial={{ x: "-100%" }}
										whileHover={{ x: "100%" }}
										transition={{ duration: 0.15 }}
									/>

									<span className="relative z-10 flex items-center gap-2">
										<Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
										<span>Get Started Now</span>
										<motion.div
											whileHover={{ x: 5 }}
											transition={{ type: "spring", stiffness: 400 }}
										>
											<ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
										</motion.div>
									</span>
								</Button>
							</Link>
						</motion.div>

						<motion.div
							variants={buttonVariants}
							whileHover="hover"
							whileTap="tap"
						>
							<a href="#product-demo">
								<Button
									variant="outline"
									size="lg"
									className="group relative w-full overflow-hidden text-sm backdrop-blur-xl sm:w-auto sm:text-base md:text-lg"
									style={{
										borderColor: colors.primary,
										borderWidth: "2px",
									}}
								>
									{/* Glass morphism effect */}
									<motion.div
										className="absolute inset-0"
										style={{
											background: `linear-gradient(to right, ${colors.primary}1A, ${colors.blue}1A)`,
										}}
										initial={{ opacity: 0 }}
										whileHover={{ opacity: 1 }}
										transition={{ duration: 0.5 }}
									/>

									<span className="relative z-10 flex items-center gap-2">
										<Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
										<span>Watch Demo</span>
									</span>
								</Button>
							</a>
						</motion.div>
					</motion.div>

					{/* Enhanced Trust Indicators with integrated satisfaction stat */}
					<motion.div
						className="mb-12 px-4 sm:mb-20 sm:px-0"
						variants={itemVariants}
					>
						<div className="flex flex-col items-center gap-6 sm:gap-8">
							{/* Main badges row */}
							<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-6">
								<motion.div
									className="relative flex items-center space-x-1 overflow-hidden rounded-md border px-2 py-1 backdrop-blur-xl sm:space-x-2 sm:rounded-lg sm:px-3 sm:py-2"
									whileHover={{
										scale: 1.05,
									}}
									transition={{ duration: 0.15 }}
								>
									<Zap
										className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
										style={{ color: colors.primary }}
									/>
									<span className="font-medium text-xs sm:text-sm">
										Real-time Analytics
									</span>
								</motion.div>

								<motion.div
									className="relative flex items-center space-x-1 overflow-hidden rounded-md border px-2 py-1 backdrop-blur-xl sm:space-x-2 sm:rounded-lg sm:px-3 sm:py-2"
									whileHover={{
										scale: 1.05,
									}}
									transition={{ duration: 0.15 }}
								>
									<Ticket
										className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
										style={{ color: colors.blue }}
									/>
									<span className="font-medium text-xs sm:text-sm">
										WhatsApp Flow
									</span>
								</motion.div>

								<motion.div
									className="relative flex items-center space-x-1 overflow-hidden rounded-md border px-2 py-1 backdrop-blur-xl sm:space-x-2 sm:rounded-lg sm:px-3 sm:py-2"
									whileHover={{
										scale: 1.05,
									}}
									transition={{ duration: 0.15 }}
								>
									<TrendingUp
										className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
										style={{ color: colors.lightGreen }}
									/>
									<span className="font-medium text-xs sm:text-sm">
										Growth Insights
									</span>
								</motion.div>
							</div>

							{/* Satisfaction stat integrated as a prominent badge */}
							<motion.div
								className="group relative"
								initial={{
									scale: 0,
									opacity: 0,
								}}
								animate={{
									scale: 1,
									opacity: 1,
								}}
								transition={{
									delay: 0.4,
									duration: 0.5,
									type: "spring",
									stiffness: 200,
									damping: 15,
								}}
							>
								{/* Glow background */}
								<motion.div
									className="-inset-2 absolute rounded-full opacity-50 blur-xl"
									style={{
										background: `linear-gradient(to right, ${colors.primary}4D, ${colors.blue}4D)`,
									}}
									animate={{
										scale: [1, 1.1, 1],
										opacity: [0.3, 0.5, 0.3],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								/>

								<motion.div
									className="relative flex items-center space-x-2 rounded-full border bg-background/60 px-4 py-2 backdrop-blur-xl sm:space-x-3 sm:px-6 sm:py-3"
									whileHover={{
										scale: 1.05,
									}}
									transition={{ duration: 0.15 }}
								>
									{/* Star ratings */}
									<div className="flex items-center space-x-0.5">
										{[...Array(5)].map((_, i) => (
											<motion.div
												key={i}
												initial={{ opacity: 0, scale: 0, rotate: -180 }}
												animate={{ opacity: 1, scale: 1, rotate: 0 }}
												transition={{
													delay: 0.5 + i * 0.05,
													duration: 0.3,
													type: "spring",
													stiffness: 300,
												}}
											>
												<Star className="h-3 w-3 fill-yellow-400 text-yellow-400 sm:h-4 sm:w-4" />
											</motion.div>
										))}
									</div>

									{/* Divider */}
									<div className="h-4 w-px bg-gradient-to-b from-transparent via-border to-transparent sm:h-6" />

									{/* Stat */}
									<motion.span
										className="font-black text-xl sm:text-2xl lg:text-3xl"
										style={{
											background: `linear-gradient(to right, ${colors.primary}, ${colors.blue})`,
											WebkitBackgroundClip: "text",
											WebkitTextFillColor: "transparent",
											backgroundClip: "text",
										}}
									>
										99.8%
									</motion.span>

									<span className="font-medium text-muted-foreground text-xs sm:text-sm">
										Satisfaction
									</span>
								</motion.div>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Enhanced Scroll Indicator */}
			<motion.div
				className="-translate-x-1/2 absolute bottom-8 left-1/2 z-20 transform sm:bottom-12"
				initial={{
					opacity: 0,
					y: 30,
					scale: 0.8,
				}}
				animate={{
					opacity: 1,
					y: 0,
					scale: 1,
				}}
				transition={{
					delay: 0.75,
					duration: 0.5,
					type: "spring",
					stiffness: 120,
				}}
			>
				<motion.div
					className="group flex cursor-pointer flex-col items-center space-y-2 sm:space-y-3"
					whileHover={{ scale: 1.1 }}
					transition={{ duration: 0.1 }}
				>
					<motion.span
						className="hidden font-medium text-muted-foreground text-xs tracking-wider sm:block"
						animate={{ opacity: [1, 0.5, 1] }}
						transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
					>
						SCROLL DOWN
					</motion.span>

					<div className="relative">
						{/* Outer glow ring */}
						<motion.div
							className="absolute inset-0 h-12 w-7 rounded-full border blur-sm sm:h-14 sm:w-8"
							style={{ borderColor: `${colors.primary}4D` }}
							animate={{ scale: [1, 1.1, 1] }}
							transition={{
								duration: 1,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>

						{/* Main scroll indicator */}
						<motion.div
							className="flex h-8 w-5 justify-center rounded-full border-2 bg-background/40 backdrop-blur-xl sm:h-10 sm:w-6"
							style={{ borderColor: colors.primary }}
							whileHover={{
								borderColor: colors.blue,
							}}
							transition={{ duration: 0.3 }}
						>
							<motion.div
								className="mt-1.5 h-2 w-0.5 rounded-full sm:mt-2 sm:h-3 sm:w-1"
								style={{
									background: `linear-gradient(to bottom, ${colors.blue}, ${colors.primary})`,
								}}
								animate={{ y: [0, 8, 0] }}
								transition={{
									duration: 0.9,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
						</motion.div>
					</div>
				</motion.div>
			</motion.div>
		</motion.section>
	);
};

export default HeroSection;
