"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";

const CTASection: React.FC = () => {
	return (
		<section className="relative overflow-hidden bg-primary px-4 py-20 sm:px-6 lg:px-8">
			<div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
				<motion.span
					className="rounded-full bg-primary-foreground/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					Ready to transform your events?
				</motion.span>
				<motion.h2
					className="mt-6 text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl"
					initial={{ opacity: 0, y: 14 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.05 }}
				>
					Launch your next event with EventzFlow
				</motion.h2>
				<motion.p
					className="mt-4 max-w-3xl text-lg text-primary-foreground/90"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					From registration to retargeting, manage everything in one powerful platform. 
					Get started in minutes with our intuitive dashboard and expert support.
				</motion.p>
				<motion.div
					className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
					initial={{ opacity: 0, y: 18 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.15 }}
				>
					<Link href={"/auth?mode=login" as Route}>
						<Button
							size="lg"
							className="group h-12 min-w-[220px] rounded-lg bg-background text-base font-semibold text-foreground shadow-lg transition-all hover:bg-background/90"
						>
							Get started
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
					<Button
						size="lg"
						variant="outline"
						asChild
						className="h-12 min-w-[220px] rounded-lg border-2 border-primary-foreground/60 bg-transparent text-base font-semibold text-primary-foreground transition-all hover:border-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
					>
						<a href="mailto:info@saleschatalyst.com">
							Talk to sales
						</a>
					</Button>
				</motion.div>
				<motion.div
					className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-foreground/80"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<span>✓ No credit card required</span>
					<span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
					<span>✓ Setup in 5 minutes</span>
					<span className="h-1 w-1 rounded-full bg-primary-foreground/70" />
					<span>✓ 24/7 support</span>
				</motion.div>
			</div>
		</section>
	);
};

export default CTASection;
