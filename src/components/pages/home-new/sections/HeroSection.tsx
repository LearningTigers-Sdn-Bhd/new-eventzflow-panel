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
			className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 px-4 pb-20 pt-24 sm:px-6 lg:px-8 lg:pt-32 xl:px-12"
		>
			{/* Professional grid pattern background */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
			
			{/* Subtle gradient orbs */}
			<div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
			<div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
			
			<div className="relative mx-auto flex w-full max-w-7xl flex-col justify-center gap-12 lg:flex-row lg:items-center lg:gap-16 xl:gap-20">
				<div className="flex-1 space-y-8 lg:space-y-10">
					{/* Trust badge */}
					<motion.div
						className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Zap className="h-4 w-4" />
						Trusted by 500+ event organizers worldwide
					</motion.div>

					<motion.h1
						className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-[4rem]"
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
						className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Transform your events with AI-powered visitor tracking, seamless QR check-in, instant badge printing, and intelligent audience profiling. Everything you need in one unified platform.
					</motion.p>

					{/* Key metrics */}
					<motion.div
						className="flex flex-wrap gap-6 pt-2"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						<div className="flex items-center gap-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
								<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">98%</p>
								<p className="text-sm text-muted-foreground">Check-in speed</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
								<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-2xl font-bold text-foreground">50K+</p>
								<p className="text-sm text-muted-foreground">Events managed</p>
							</div>
						</div>
					</motion.div>

					<motion.div
						className="flex flex-wrap items-center gap-4 pt-4"
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<Link href={"/auth?mode=login" as Route}>
							<Button
								size="lg"
								className="group h-12 min-w-[220px] bg-emerald-600 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-600/30 dark:bg-emerald-500 dark:hover:bg-emerald-400"
							>
								Start Free Trial
								<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
						<a
							className="inline-flex h-12 items-center gap-2 rounded-lg border-2 border-border bg-background px-6 text-base font-semibold text-foreground transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
							href="#product-demo"
						>
							<PlayCircle className="h-5 w-5" />
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
						<div className="absolute -right-4 -top-4 z-10 rounded-xl border border-emerald-500/20 bg-background px-4 py-2 shadow-xl">
							<div className="flex items-center gap-2">
								<div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
								<span className="text-sm font-semibold text-foreground">Live Event</span>
							</div>
						</div>

						{/* Main dashboard card */}
						<div className="rounded-2xl border border-border bg-card shadow-2xl">
							<div className="border-b border-border bg-muted/30 px-6 py-4">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-sm font-semibold text-muted-foreground">Event Dashboard</h3>
										<p className="text-xl font-bold text-foreground">Tech Summit 2025</p>
									</div>
									<div className="rounded-lg bg-emerald-500/10 px-3 py-1.5">
										<span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active</span>
									</div>
								</div>
							</div>
							
							<div className="space-y-4 p-6">
								{/* Stats grid */}
								<div className="grid grid-cols-2 gap-4">
									<div className="rounded-lg border border-border bg-muted/30 p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Attendees
										</p>
										<p className="mt-2 text-2xl font-bold text-foreground">
											1,247
										</p>
										<div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
											<TrendingUp className="h-3 w-3" />
											<span>+23%</span>
										</div>
									</div>
									<div className="rounded-lg border border-border bg-muted/30 p-4">
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											Check-in Rate
										</p>
										<p className="mt-2 text-2xl font-bold text-foreground">
											94%
										</p>
										<p className="mt-1 text-xs font-medium text-muted-foreground">
											1,172 checked in
										</p>
									</div>
								</div>

								{/* Activity list */}
								<div className="space-y-2">
									<div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
										<div className="flex items-center gap-3">
											<div className="h-2 w-2 rounded-full bg-emerald-500" />
											<div>
												<p className="text-sm font-medium text-foreground">Booth B-12 Analytics</p>
												<p className="text-xs text-muted-foreground">High engagement detected</p>
											</div>
										</div>
										<span className="text-xs font-medium text-muted-foreground">2m ago</span>
									</div>
									<div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
										<div className="flex items-center gap-3">
											<div className="h-2 w-2 rounded-full bg-blue-500" />
											<div>
												<p className="text-sm font-medium text-foreground">AI Segment Created</p>
												<p className="text-xs text-muted-foreground">247 profiles matched</p>
											</div>
										</div>
										<span className="text-xs font-medium text-muted-foreground">5m ago</span>
									</div>
									<div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
										<div className="flex items-center gap-3">
											<div className="h-2 w-2 rounded-full bg-purple-500" />
											<div>
												<p className="text-sm font-medium text-foreground">Badge Printed</p>
												<p className="text-xs text-muted-foreground">VIP attendee checked in</p>
											</div>
										</div>
										<span className="text-xs font-medium text-muted-foreground">8m ago</span>
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
