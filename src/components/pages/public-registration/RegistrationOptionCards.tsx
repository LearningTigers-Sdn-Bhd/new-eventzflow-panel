"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PublicRegistrationFormItem } from "@/lib/api/public-registration";

const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export function RegistrationOptionCards({
	eventSlug,
	forms,
}: {
	eventSlug: string;
	forms: PublicRegistrationFormItem[];
}) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{forms.map((form, index) => (
				<motion.div
					key={form.slug}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						duration: 0.6,
						delay: index * 0.1,
						ease: SMOOTH_EASE,
					}}
				>
					<Link
						href={`/events/${encodeURIComponent(eventSlug)}/register/${encodeURIComponent(form.slug)}`}
						className="group relative flex h-full min-h-[300px] flex-col rounded-[32px] border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-green hover:shadow-2xl hover:shadow-brand-green/5"
					>
						{/* Header: Arrow */}
						<div className="mb-8 flex items-start justify-between">
							<div />
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-all duration-300 group-hover:rotate-[-45deg] group-hover:bg-brand-green group-hover:text-white">
								<ArrowRight className="h-5 w-5" />
							</div>
						</div>

						{/* Body */}
						<div className="flex-1">
							<h2 className="mb-4 font-bold text-3xl text-slate-900 leading-tight tracking-tight">
								{form.name}
							</h2>

							{form.description ? (
								<p className="max-w-[90%] text-slate-600 text-sm leading-relaxed">
									{form.description}
								</p>
							) : (
								<p className="text-slate-600 text-sm">
									Complete your {form.name.toLowerCase()} registration here.
								</p>
							)}
						</div>

						{/* Subtle Footer indicator */}
						<div className="mt-8 flex items-center gap-2 overflow-hidden">
							<div className="h-px w-8 bg-slate-200 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-green" />
							<span className="font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-brand-green">
								Continue
							</span>
						</div>

						{/* Unique decorative element (bottom right) */}
						<div className="absolute right-8 bottom-6 opacity-0 transition-opacity duration-500 group-hover:opacity-10">
							<div className="h-16 w-16 rounded-full border-4 border-brand-green" />
						</div>
					</Link>
				</motion.div>
			))}
		</div>
	);
}
