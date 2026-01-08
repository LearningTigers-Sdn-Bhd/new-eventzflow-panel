"use client";

import { motion } from "framer-motion";
import type React from "react";

const marqueeItems = [
	"LIGHTNING-FAST EFFICIENCY",
	"ENTERPRISE-GRADE SECURITY",
	"MASSIVE TIME & COST SAVINGS",
	"DATA-DRIVEN GROWTH",
	"SEAMLESS INTEGRATIONS",
	"REAL-TIME ANALYTICS",
	"AUTOMATED WORKFLOWS",
	"SCALABLE SOLUTIONS",
];

const BenefitsSection: React.FC = () => {
	// Triple the items for smoother infinite loop
	const tripleItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

	return (
		<section className="relative overflow-hidden">
			{/* Marquee content */}
			<div className="relative overflow-hidden bg-white py-6">
				<div className="flex">
					<motion.div
						className="flex shrink-0 whitespace-nowrap"
						initial={{ x: 0 }}
						animate={{ x: "-33.333%" }}
						transition={{
							repeat: Infinity,
							repeatType: "loop",
							duration: 40,
							ease: "linear",
						}}
					>
						{tripleItems.map((item, index) => (
							<span
								key={index}
								className="flex shrink-0 items-center font-black text-xl tracking-tight text-black sm:text-2xl md:text-4xl lg:text-5xl"
							>
								<span className="mx-6">{item}</span>
								<span className="mx-6 text-black/30">•</span>
							</span>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default BenefitsSection;
