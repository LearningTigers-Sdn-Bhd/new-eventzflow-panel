"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	PlayCircle,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import FloatingNav from "./FloatingNav";

const HeroSection: React.FC = () => {
	return (
		<>
			<FloatingNav />
		<section
			id="hero"
			className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pt-32 xl:px-12"
		>
			{/* Professional grid pattern background */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
			
			{/* Subtle gradient orbs */}
			<div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
			<div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
			
			<div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center gap-8 sm:gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
				<div className="flex-1 space-y-6 sm:space-y-8 lg:space-y-10">
					{/* Trust badge */}
					<motion.div
						className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:px-4 sm:py-2 sm:text-sm dark:text-emerald-400"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span className="whitespace-nowrap">Trusted by 500+ event organizers</span>
					</motion.div>

					<motion.h1
						className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4rem]"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						End-to-End Event
						<br />
						<span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400">
							Intelligence Platform
						</span>
					</motion.h1>
					
					<motion.p
						className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Transform your events with AI-powered visitor tracking, seamless QR check-in, instant badge printing, and intelligent audience profiling. Everything you need in one unified platform.
					</motion.p>

					{/* Key metrics */}
					<motion.div
						className="flex flex-wrap gap-4 pt-2 sm:gap-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						<div className="flex items-center gap-2">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
								<TrendingUp className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
							</div>
							<div>
								<p className="text-xl font-bold text-foreground sm:text-2xl">98%</p>
								<p className="text-xs text-muted-foreground sm:text-sm">Check-in speed</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 sm:h-10 sm:w-10">
								<Users className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-xl font-bold text-foreground sm:text-2xl">50K+</p>
								<p className="text-xs text-muted-foreground sm:text-sm">Events managed</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						className="flex flex-col items-stretch gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<Link href={"/auth?mode=login" as Route} className="w-full sm:w-auto">
							<Button
								size="lg"
								className="group h-11 w-full bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/30 sm:h-12 sm:min-w-[220px] sm:text-base dark:bg-emerald-500 dark:hover:bg-emerald-400"
							>
								Start Free Trial
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
							</Button>
						</Link>
						<a
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-border bg-background px-5 text-sm font-semibold text-foreground transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 sm:h-12 sm:w-auto sm:px-6 sm:text-base dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
							href="#product-demo"
						>
							<PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
							Watch Demo
						</a>
					</motion.div>
				</div>

				<motion.div
					className="relative w-full flex-shrink-0 lg:max-w-xl"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.7, delay: 0.3 }}
				>
					{/* Professional dashboard preview */}
					<div className="relative">
						{/* Floating badge */}
						<div className="absolute -right-2 -top-2 z-10 rounded-lg border border-emerald-500/20 bg-background px-3 py-1.5 shadow-xl sm:-right-4 sm:-top-4 sm:rounded-xl sm:px-4 sm:py-2">
							<div className="flex items-center gap-1.5 sm:gap-2">
								<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
								<span className="text-xs font-semibold text-foreground sm:text-sm">Live Event</span>
							</div>
						</div>

						{/* Main dashboard card */}
						<div className="rounded-xl border border-border bg-card shadow-2xl sm:rounded-2xl">
							<div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6 sm:py-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xs font-semibold text-muted-foreground sm:text-sm">Event Dashboard</h3>
										<p className="text-base font-bold text-foreground sm:text-xl">Tech Summit 2025</p>
									</div>
									<div className="rounded-md bg-emerald-500/10 px-2 py-1 sm:rounded-lg sm:px-3 sm:py-1.5">
										<span className="text-xs font-bold text-emerald-600 sm:text-sm dark:text-emerald-400">Active</span>
									</div>
								</div>
							</div>
							
							<div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
								{/* Stats grid */}
								<div className="grid grid-cols-2 gap-3 sm:gap-4">
									<div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
										<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
											Attendees
										</p>
										<p className="mt-1.5 text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">
											1,247
										</p>
										<div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600 sm:mt-1 sm:text-xs dark:text-emerald-400">
											<TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
											<span>+23%</span>
										</div>
									</div>
									<div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
										<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
											Check-in Rate
										</p>
										<p className="mt-1.5 text-xl font-bold text-foreground sm:mt-2 sm:text-2xl">
											94%
										</p>
										<p className="mt-0.5 text-[10px] font-medium text-muted-foreground sm:mt-1 sm:text-xs">
											1,172 checked in
										</p>
									</div>
								</div>

								{/* Activity list */}
								<div className="space-y-1.5 sm:space-y-2">
									<div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 sm:p-3">
										<div className="flex min-w-0 items-center gap-2 sm:gap-3">
											<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500 sm:h-2 sm:w-2" />
											<div className="min-w-0">
												<p className="truncate text-xs font-medium text-foreground sm:text-sm">Booth B-12 Analytics</p>
												<p className="truncate text-[10px] text-muted-foreground sm:text-xs">High engagement detected</p>
											</div>
										</div>
										<span className="flex-shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">2m ago</span>
									</div>
									<div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 sm:p-3">
										<div className="flex min-w-0 items-center gap-2 sm:gap-3">
											<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 sm:h-2 sm:w-2" />
											<div className="min-w-0">
												<p className="truncate text-xs font-medium text-foreground sm:text-sm">AI Segment Created</p>
												<p className="truncate text-[10px] text-muted-foreground sm:text-xs">247 profiles matched</p>
											</div>
										</div>
										<span className="flex-shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">5m ago</span>
									</div>
									<div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 sm:p-3">
										<div className="flex min-w-0 items-center gap-2 sm:gap-3">
											<div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500 sm:h-2 sm:w-2" />
											<div className="min-w-0">
												<p className="truncate text-xs font-medium text-foreground sm:text-sm">Badge Printed</p>
												<p className="truncate text-[10px] text-muted-foreground sm:text-xs">VIP attendee checked in</p>
											</div>
										</div>
										<span className="flex-shrink-0 text-[10px] font-medium text-muted-foreground sm:text-xs">8m ago</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
		</>
	);
};

export default HeroSection;
