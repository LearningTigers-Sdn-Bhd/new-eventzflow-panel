"use client";

import { motion } from "framer-motion";
import { SMOOTH_EASE } from "@/lib/constants/animation";

export default function QuoteSection() {
	return (
		<section className="bg-black px-6 py-24 md:py-32">
			<div className="mx-auto max-w-5xl text-center">
				<motion.p
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="font-black text-3xl italic uppercase tracking-tight text-white md:text-4xl lg:text-5xl"
				>
					"Technology is best when it brings people together."
				</motion.p>
			</div>
		</section>
	);
}
