"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, HelpCircle, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
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

function CTALinkCard({ link }: { link: CTALink }) {
	return (
		<Link
			href={link.href as Route}
			className="group relative aspect-16/10 h-75 w-full border border-white/50 bg-transparent transition-all hover:bg-white md:aspect-video md:h-auto lg:aspect-16/10"
		>
			{/* Layer 1: Icon (Top Left) */}
			<div className="absolute top-3 w-full border-white/30 border-t border-dashed group-hover:border-black/50 lg:top-6" />
			<div className="absolute left-3 h-full border-white/30 border-l border-dashed group-hover:border-black/50 lg:left-6" />
			<div className="absolute left-12 h-full border-white/30 border-r border-dashed group-hover:border-black/50 lg:left-18" />
			<div className="absolute top-12 w-full border-white/30 border-t border-dashed group-hover:border-black/50 lg:top-18" />
			<div className="absolute inset-0 flex h-full w-full flex-col items-start justify-start ps-3 pt-3 lg:ps-6 lg:pt-6">
				<div className="flex flex-col items-center justify-center bg-white/60 p-1 group-hover:bg-black/60 lg:p-1.5">
					<link.icon className="size-7 text-stone-100 transition-colors group-hover:text-white lg:size-9" />
				</div>
			</div>

			{/* Layer 2: Text (Bottom) */}
			<div className="absolute top-12 left-12 flex h-[72%] flex-col justify-end lg:top-18 lg:left-18">
				<div className="w-full p-3">
					<h3 className="font-bold text-white text-xl uppercase tracking-tight transition-colors group-hover:text-black md:text-2xl">
						{link.label}
					</h3>
					<p className="mt-2 line-clamp-3 text-balance text-sm text-white/60 transition-colors group-hover:text-black/70 md:text-base">
						{link.description}
					</p>
				</div>
			</div>
		</Link>
	);
}

export default function CTASection() {
	return (
		<section className="bg-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-7xl">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
				>
					<div className="mb-16 text-center">
						<div className="mx-auto mb-8 h-px w-16 bg-white/30" />
						<h2 className="mb-6 font-bold text-3xl text-white tracking-tight md:text-4xl lg:text-5xl">
							Want to know more about EventzFlow?
						</h2>
						<p className="mx-auto max-w-2xl text-base text-white/60 md:text-lg">
							Explore our resources or get in touch with our team to see how we
							can help you build better event experiences.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:md:col-span-2 [&>*:last-child]:md:h-75 [&>*:last-child]:lg:col-span-1 [&>*:last-child]:lg:h-auto">
						{links.map((link) => (
							<CTALinkCard key={link.label} link={link} />
						))}
					</div>
					{/* Decorative line */}
					<div className="mx-auto mt-16 h-px w-16 bg-white/30" />
				</motion.div>
			</div>
		</section>
	);
}
