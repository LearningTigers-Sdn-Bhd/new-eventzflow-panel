"use client";

import type React from "react";
import { motion } from "framer-motion";

const galleryImages = [
	{
		url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
		alt: "Conference event with attendees",
	},
	{
		url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop",
		alt: "Exhibition booth setup",
	},
	{
		url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
		alt: "Event stage and lighting",
	},
	{
		url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop",
		alt: "Corporate event venue",
	},
	{
		url: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&h=400&fit=crop",
		alt: "Event check-in kiosk",
	},
	{
		url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
		alt: "Networking event",
	},
	{
		url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600&h=400&fit=crop",
		alt: "Event registration desk",
	},
	{
		url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop",
		alt: "Trade show floor",
	},
	{
		url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
		alt: "Event technology setup",
	},
	{
		url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop",
		alt: "Conference hall",
	},
	{
		url: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop",
		alt: "Event management dashboard",
	},
	{
		url: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=600&h=400&fit=crop",
		alt: "Professional event setup",
	},
];

const SolutionsGallerySection: React.FC = () => {
	return (
		<section id="solutions" className="relative overflow-hidden bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
			{/* Professional background elements */}
			<div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
			
			<div className="relative mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-12 sm:gap-4">
					<motion.span
						className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground sm:px-4 sm:py-2 sm:text-xs"
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.4 }}
					>
						<span className="whitespace-nowrap">Events That Inspire</span>
					</motion.span>
					<motion.h2
						className="max-w-4xl px-2 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.05 }}
					>
						See EventzFlow in Action at
						<br />
						World-Class Events
					</motion.h2>
					<motion.p
						className="max-w-3xl px-2 text-sm text-muted-foreground sm:text-base lg:text-lg"
						initial={{ opacity: 0, y: 16 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
					>
						From large-scale conferences to exclusive executive summits, our platform delivers 
						exceptional experiences. Discover how EventzFlow transforms ordinary events into 
						memorable, data-driven success stories.
					</motion.p>
				</div>

				{/* Gallery Grid */}
				<div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
					{galleryImages.map((image, index) => (
						<motion.div
							key={index}
							className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{ duration: 0.5, delay: index * 0.03 }}
						>
							<div className="relative aspect-[3/2] overflow-hidden">
								<img
									src={image.url}
									alt={image.alt}
									className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
									loading="lazy"
								/>
								{/* Gradient overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default SolutionsGallerySection;

