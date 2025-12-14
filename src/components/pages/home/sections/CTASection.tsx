"use client";

import { motion } from "framer-motion";
import { ArrowRight, PodcastIcon, Rocket } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
	return (
		<section className="relative overflow-hidden bg-primary px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
			<div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
				<motion.span
					className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 font-semibold text-[10px] text-primary-foreground uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					<Rocket className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
					Ready to transform your events?
				</motion.span>
				<motion.h2
					className="mt-4 px-2 font-semibold text-2xl text-primary-foreground sm:mt-6 sm:text-3xl lg:text-4xl xl:text-5xl"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.05 }}
				>
					Launch your next event with EventzFlow
				</motion.h2>
				<motion.p
					className="mt-3 max-w-3xl px-2 text-primary-foreground/90 text-sm sm:mt-4 sm:text-base lg:text-lg"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					From registration to retargeting, manage everything in one powerful
					platform. Get started in minutes with our intuitive dashboard and
					expert support.
				</motion.p>
				<motion.div
					className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4 lg:mt-10"
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.15 }}
				>
					<Link href={"/auth?mode=login" as Route} className="w-full sm:w-auto">
						<Button
							size="lg"
							className="group h-11 w-full rounded-lg bg-background font-semibold text-foreground text-sm shadow-lg transition-all hover:bg-background/90 sm:h-12 sm:min-w-[220px] sm:text-base"
						>
							Get started
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
					<Button
						size="lg"
						variant="outline"
						asChild
						className="h-11 w-full rounded-lg border-2 border-primary-foreground/60 bg-transparent font-semibold text-primary-foreground text-sm transition-all hover:border-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:h-12 sm:w-auto sm:min-w-[220px] sm:text-base"
					>
						<a href="mailto:info@eventzflow.com">
							Talk to sales
							<PodcastIcon className="ml-2 h-4 w-4" />
						</a>
					</Button>
				</motion.div>
				<motion.div
					className="mt-6 flex flex-wrap items-center justify-center gap-2 text-primary-foreground/80 text-xs sm:mt-8 sm:gap-4 sm:text-sm lg:mt-10"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<span className="whitespace-nowrap">✓ No credit card required</span>
					<span className="hidden h-1 w-1 rounded-full bg-primary-foreground/70 sm:inline-block" />
					<span className="whitespace-nowrap">✓ Setup in 5 minutes</span>
					<span className="hidden h-1 w-1 rounded-full bg-primary-foreground/70 sm:inline-block" />
					<span className="whitespace-nowrap">✓ 24/7 support</span>
				</motion.div>
			</div>
		</section>
	);
};

export default CTASection;
