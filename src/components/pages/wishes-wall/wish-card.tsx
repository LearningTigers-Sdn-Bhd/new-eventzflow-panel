"use client";

import { motion } from "framer-motion";
import type { Wish } from "@/lib/api/wishes";

type WishCardProps = {
	wish: Wish;
};

export function WishCard({ wish }: WishCardProps) {
	return (
		<motion.article
			layout
			initial={{ opacity: 0, y: 24, scale: 0.96 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -24, scale: 0.96 }}
			transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			className="flex min-h-[220px] flex-col justify-between rounded-[1.75rem] border border-amber-100/15 bg-white/8 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md"
		>
			<p className="font-serif text-xl text-stone-100 leading-relaxed lg:text-2xl">
				{wish.message}
			</p>
			<div className="mt-6 border-amber-200/20 border-t pt-4">
				<p className="font-semibold text-[11px] text-amber-200 uppercase tracking-[0.32em]">
					{wish.guest_name}
				</p>
			</div>
		</motion.article>
	);
}
