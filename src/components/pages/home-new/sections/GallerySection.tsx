"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { SMOOTH_EASE } from "@/lib/constants/animation";

const galleryImages = [
	{
		src: "/images/homepage/Gallery1.webp",
		alt: "EventzFlow in action - Event check-in",
	},
	{
		src: "/images/homepage/Gallery2.webp",
		alt: "EventzFlow in action - Conference networking",
	},
	{
		src: "/images/homepage/Gallery3.webp",
		alt: "EventzFlow in action - Exhibition booth",
	},
];

const GallerySection: React.FC = () => {
	return (
		<section className="bg-black px-6 py-16 md:py-24 lg:py-32 lg:px-16">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					className="mb-10 md:mb-16"
				>
					<h2 className="font-black text-3xl uppercase tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
						See EventzFlow
						<br />
						In Action
					</h2>
					<p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/70 md:mt-4 md:text-xl">
						Real events, real results. Here&apos;s a glimpse of what we do.
					</p>
				</motion.div>

				{/* Gallery Grid - Staggered Layout */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
					{galleryImages.map((image, index) => (
						<motion.div
							key={image.src}
							initial={{ opacity: 0, y: 60 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								duration: 0.8,
								delay: index * 0.15,
								ease: SMOOTH_EASE,
							}}
							className={`group relative overflow-hidden ${
								index === 1 ? "md:mt-24 md:h-[500px]" : "md:h-[400px]"
							} h-[250px] sm:h-[300px]`}
						>
							{/* Image number badge */}
							<div className="absolute left-4 top-4 z-10 text-xs font-medium text-white/60">
								0{index + 1}
							</div>

							{/* Image */}
							<Image
								src={image.src}
								alt={image.alt}
								fill
								priority={index === 0}
								className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
								sizes="(max-width: 768px) 100vw, 33vw"
							/>

							{/* Hover overlay */}
							<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default GallerySection;
