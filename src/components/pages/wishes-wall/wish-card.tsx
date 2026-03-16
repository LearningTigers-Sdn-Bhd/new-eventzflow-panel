"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { Wish } from "@/lib/api/wishes";

type WishCardProps = {
	wish: Wish;
	index: number;
};

export function WishCard({ wish, index }: WishCardProps) {
	// Generate a stable random rotation between -2 and +2 degrees for a "scattered polaroid" feel
	const rotation = useMemo(() => {
		const hash = wish.guest_name.length + wish.message.length;
		return (hash % 5) - 2;
	}, [wish.guest_name, wish.message]);

	return (
		<motion.article
			layout
			initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
			animate={{
				opacity: 1,
				rotateY: rotation,
				scale: 1,
			}}
			exit={{
				opacity: 0,
				rotateY: -90,
				scale: 0.9,
				transition: { delay: index * 0.05, duration: 0.3 },
			}}
			transition={{
				type: "spring",
				stiffness: 80,
				damping: 15,
				delay: index * 0.1,
			}}
			whileHover={{
				scale: 1.05,
				rotate: 0,
				rotateY: 0,
				zIndex: 20,
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
				transition: { delay: 0, duration: 0.2 },
			}}
			className="relative flex min-h-[280px] flex-col justify-center bg-[#FFFCF8] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-stone-900/5 sm:p-10"
			style={{
				transformStyle: "preserve-3d",
				backfaceVisibility: "hidden",
				// Creates a subtle paper texture effect
				backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
			}}
		>
			{/* Top pin/tape illusion */}
			<div className="absolute top-0 left-1/2 z-20 h-3 w-12 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] border border-stone-200/50 bg-white/40 shadow-sm backdrop-blur-sm" />

			<div
				className="relative z-10 flex h-full flex-col items-center justify-center space-y-8 text-center"
				style={{ backfaceVisibility: "hidden" }}
			>
				<p className="whitespace-pre-wrap font-serif text-stone-700 text-xl leading-[1.8] tracking-wide lg:text-2xl">
					"{wish.message}"
				</p>

				<div className="flex flex-col items-center gap-2">
					<div className="mb-2 h-px w-12 bg-stone-300" />
					<p className="font-serif text-2xl text-stone-900 italic">
						{wish.guest_name}
					</p>
				</div>
			</div>
		</motion.article>
	);
}
