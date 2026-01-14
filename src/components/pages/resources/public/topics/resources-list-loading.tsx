"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const letters = [
	{ id: "l-1", char: "L" },
	{ id: "o-2", char: "O" },
	{ id: "a-3", char: "A" },
	{ id: "d-4", char: "D" },
	{ id: "i-5", char: "I" },
	{ id: "n-6", char: "N" },
	{ id: "g-7", char: "G" },
];

const containerVariants: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.15, // Delay between each letter starting its animation
			delayChildren: 0.2,
		},
	},
};

const letterVariants: Variants = {
	initial: { y: "100%", opacity: 0 },
	animate: {
		y: ["100%", "0%", "0%", "100%"],
		opacity: [0, 1, 1, 0],
		transition: {
			duration: 2, // Total cycle duration for one letter
			times: [0, 0.3, 0.8, 1], // Timing for keyframes
			repeat: Number.POSITIVE_INFINITY,
			repeatDelay: 0.5, // Pause before repeating
			ease: [0.34, 1.56, 0.64, 1], // Spring-like ease out
		},
	},
};

export function ResourcesListLoading({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex h-80 flex-col items-center justify-center bg-white",
				className,
			)}
		>
			<motion.div
				className="flex overflow-hidden font-black text-5xl text-black uppercase tracking-tighter sm:text-7xl"
				variants={containerVariants}
				initial="initial"
				animate="animate"
			>
				{letters.map((letter) => (
					<motion.span
						key={letter.id}
						variants={letterVariants}
						className="inline-block origin-bottom"
					>
						{letter.char}
					</motion.span>
				))}
			</motion.div>
		</div>
	);
}
