"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
	return (
		<section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
			<div className="container mx-auto max-w-4xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					{/* Stats Row */}
					<div className="mb-12 grid grid-cols-3 gap-8">
						{[
							{ value: "10K+", label: "Events Managed" },
							{ value: "2M+", label: "Tickets Sold" },
							{ value: "5 min", label: "Setup Time" },
						].map((stat, index) => (
							<div key={index} className="text-center">
								<div className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
									{stat.value}
								</div>
								<div className="text-sm text-muted-foreground">{stat.label}</div>
							</div>
						))}
					</div>

					{/* Main CTA */}
					<h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
						Ready to Get Started?
					</h2>
					<p className="mb-8 text-lg text-muted-foreground">
						Join 5,000+ successful event organizers managing registration,
						check-in, and badge printing with AI-powered intelligence.
					</p>

					{/* CTAs */}
					<div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link href={"/auth?mode=login" as Route}>
							<Button
								size="lg"
								className="min-w-[200px] bg-green-600 text-white hover:bg-green-700"
							>
								Get Started
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
						<a href="#product-demo">
							<Button
								variant="outline"
								size="lg"
								className="min-w-[200px] border-2"
							>
								See Platform Demo
							</Button>
						</a>
					</div>

					{/* Social Proof */}
					<div className="mb-4 flex items-center justify-center space-x-1">
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								className="h-5 w-5 fill-yellow-400 text-yellow-400"
							/>
						))}
					</div>
					<p className="mb-6 text-sm text-muted-foreground">
						Trusted by 5,000+ event organizers worldwide
					</p>

					{/* Trust Badges */}
					<p className="text-sm text-muted-foreground">
						✓ Free plan available ✓ No credit card required ✓ Cancel anytime
					</p>
				</motion.div>
			</div>
		</section>
	);
};

export default CTASection;

