"use client";

import { motion } from "framer-motion";

export function CheckInLoading() {
	return (
		<div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white-background text-black">
			{/* Subtle Background Pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>

			<div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center">
				{/* Loading Animation - Bouncing Dots */}
				<div className="flex items-center gap-2">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="h-3 w-3 rounded-full bg-brand-green"
							animate={{
								y: [-4, 4, -4],
								scale: [1, 0.9, 1],
								opacity: [0.6, 1, 0.6],
							}}
							transition={{
								duration: 1.2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
								delay: i * 0.15,
							}}
						/>
					))}
				</div>

				{/* Static Text */}
				<p className="font-medium text-neutral-500 text-sm tracking-wide sm:text-base">
					Just a moment...
				</p>
			</div>
		</div>
	);
}
