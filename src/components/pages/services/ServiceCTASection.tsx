"use client";

import { motion } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";
import { SMOOTH_EASE } from "@/lib/constants/animation";

interface ServiceCTASectionProps {
	title: string;
	description: string;
	primaryButtonText?: string;
	primaryButtonHref?: string;
	secondaryButtonText?: string;
	secondaryButtonHref?: string;
}

export default function ServiceCTASection({
	title,
	description,
	primaryButtonText = "Get Started Now",
	primaryButtonHref = "/auth?login",
	secondaryButtonText = "Contact Sales",
	secondaryButtonHref = "/contact",
}: ServiceCTASectionProps) {
	return (
		<section className="border border-black bg-blue-background px-6 py-24 md:py-32">
			<div className="mx-auto max-w-4xl text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				>
					{/* Decorative line */}
					<div className="mx-auto mb-8 h-px w-16 bg-black" />

					<h2 className="mb-6 font-bold text-3xl text-black tracking-tight md:text-4xl lg:text-5xl">
						{title}
					</h2>
					<p className="mb-10 text-base text-black/60 md:text-lg">
						{description}
					</p>

					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
						<Link href={primaryButtonHref as Route}>
							<motion.button
								className="w-full border border-black bg-black px-10 py-4 font-bold text-sm text-white uppercase tracking-[0.15em] transition-all hover:bg-black/80 sm:w-auto"
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
							>
								{primaryButtonText}
							</motion.button>
						</Link>
						<Link href={secondaryButtonHref as Route}>
							<motion.button
								className="w-full border border-black/30 bg-brand-blue px-10 py-4 font-bold text-black text-sm uppercase tracking-[0.15em] transition-all hover:border-black hover:bg-white/20 sm:w-auto"
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300, damping: 20 }}
							>
								{secondaryButtonText}
							</motion.button>
						</Link>
					</div>

					{/* Decorative line */}
					<div className="mx-auto mt-12 h-px w-16 bg-black" />
				</motion.div>
			</div>
		</section>
	);
}
