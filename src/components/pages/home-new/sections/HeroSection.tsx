"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
	return (
		<section className="relative bg-background px-4 py-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
			<div className="container mx-auto max-w-6xl">
				<div className="mx-auto max-w-4xl text-center">
					{/* Clean, Simple Badge */}
					<motion.div
						className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<span className="h-2 w-2 rounded-full bg-green-500" />
						<span className="text-muted-foreground">
							AI-Powered Event Intelligence
						</span>
					</motion.div>

					{/* Clean Hero Title */}
					<motion.h1
						className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						End-to-End, AI-Powered
						<br />
						<span className="text-green-600">Event Intelligence</span>
					</motion.h1>

					{/* Simple Subtitle */}
					<motion.p
						className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						From visitor booth tracking and QR check-in with instant badge
						printing, to AI audience profiling and retargeting — EventzFlow
						connects every part of the event journey.
					</motion.p>

					{/* Clean CTAs */}
					<motion.div
						className="flex flex-col items-center justify-center gap-4 sm:flex-row"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Link href={"/auth?mode=login" as Route}>
							<Button
								size="lg"
								className="group min-w-[200px] bg-green-600 text-white hover:bg-green-700"
							>
								Get Started
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
						<a href="#product-demo">
							<Button
								variant="outline"
								size="lg"
								className="min-w-[200px] border-2"
							>
								Watch Demo
							</Button>
						</a>
					</motion.div>

					{/* Clean Trust Indicators */}
					<motion.div
						className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-green-600" />
							<span>AI Profiling</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-green-600" />
							<span>Instant Badges</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="h-1 w-1 rounded-full bg-green-600" />
							<span>Booth Analytics</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;

