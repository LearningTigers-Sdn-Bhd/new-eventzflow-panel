"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ArrowUpRight, HelpCircle, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { SMOOTH_EASE } from "@/lib/constants/animation";

interface CTALink {
	label: string;
	description: string;
	href: string;
	icon: LucideIcon;
}

const links: CTALink[] = [
	{
		label: "Browse FAQ",
		description:
			"Find quick answers to common questions about our platform and services.",
		href: "/#faq",
		icon: HelpCircle,
	},
	{
		label: "Contact Us",
		description:
			"Have specific requirements? Our team is here to help you find the right solution.",
		href: "/contact",
		icon: Phone,
	},
	{
		label: "Get Started",
		description:
			"Join the community of event professionals and elevate your attendee experience.",
		href: "/auth?login",
		icon: ArrowRight,
	},
];

const MotionLink = motion.create(Link);

function CTALinkCard({ link, index }: { link: CTALink; index: number }) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<MotionLink
			href={link.href as Route}
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: index * 0.1 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="group relative aspect-16/10 h-75 w-full border border-white/50 bg-transparent transition-all hover:bg-white md:aspect-video md:h-auto lg:aspect-16/10"
		>
			{/* Layer 1: Icon (Top Left) */}
			<div className="absolute top-3 w-full border-white/40 border-t border-dashed group-hover:border-black/60 lg:top-6" />
			<div className="absolute left-3 h-full border-white/40 border-l border-dashed group-hover:border-black/60 lg:left-6" />
			<div className="absolute left-12 h-full border-white/40 border-r border-dashed group-hover:border-black/60 lg:left-18" />
			<div className="absolute top-12 w-full border-white/40 border-t border-dashed group-hover:border-black/60 lg:top-18" />
			<div className="absolute inset-0 flex h-full w-full flex-col items-start justify-start ps-3 pt-3 lg:ps-6 lg:pt-6">
				<div className="flex flex-col items-center justify-center bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.2),rgba(255,255,255,0.2)_1px,transparent_1px,transparent_2px)] p-1 transition-all group-hover:bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_2px)] lg:p-1.5">
					<link.icon className="size-7 text-stone-100 transition-colors group-hover:text-black lg:size-9" />
				</div>
			</div>

			{/* Layer 2: Text (Bottom) */}
			<div className="absolute top-12 left-12 flex h-[72%] flex-col justify-end lg:top-18 lg:left-18">
				<div className="w-full p-3">
					<div className="flex items-center gap-2">
						<h3 className="font-bold text-white text-xl uppercase tracking-tight transition-colors group-hover:text-black md:text-2xl">
							{link.label}
						</h3>
						<div className="overflow-hidden">
							<AnimatePresence>
								{isHovered && (
									<motion.div
										initial={{ x: -20, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										exit={{ x: -20, opacity: 0 }}
										transition={{ duration: 0.3, ease: SMOOTH_EASE }}
									>
										<ArrowUpRight className="h-6 w-6 text-black" />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
					<p className="mt-2 line-clamp-3 text-balance text-sm text-white/60 transition-colors group-hover:text-black/70 md:text-base">
						{link.description}
					</p>
				</div>
			</div>
		</MotionLink>
	);
}

export default function CTASection() {
	return (
		<section className="bg-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					>
						<div className="mx-auto mb-8 h-px w-16 bg-white/30" />
						<h2 className="mb-6 font-bold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
							Want to know more about EventzFlow?
						</h2>
						<p className="mx-auto max-w-2xl text-base text-white/60 md:text-lg">
							Explore our resources or get in touch with our team to see how we
							can help you build better event experiences.
						</p>
					</motion.div>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:md:col-span-2 [&>*:last-child]:md:h-75 [&>*:last-child]:lg:col-span-1 [&>*:last-child]:lg:h-auto">
					{links.map((link, index) => (
						<CTALinkCard key={link.label} link={link} index={index} />
					))}
				</div>
				{/* Decorative line */}
				<div className="mx-auto mt-16 h-px w-16 bg-white/30" />
			</div>
		</section>
	);
}
