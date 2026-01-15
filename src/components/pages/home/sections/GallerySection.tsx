"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const galleryImages = [
	{
		id: "01",
		src: "/images/homepage/Gallery1.webp",
		title: "CHECK-IN",
		subtitle: "FLOW CONTROL",
		className: "md:row-span-2 md:col-span-1", // Vertical Hero
	},
	{
		id: "02",
		src: "/images/homepage/Gallery2.webp",
		title: "CONNECT",
		subtitle: "DATA MESH",
		className: "md:col-span-1", // Horizontal Stack
	},
	{
		id: "03",
		src: "/images/homepage/Gallery3.webp",
		title: "ENGAGE",
		subtitle: "SPATIAL ANALYTICS",
		className: "md:col-span-1", // Horizontal Stack
	},
];

const GallerySection: React.FC = () => {
	return (
		<section className="bg-white-background px-4 py-16 text-neutral-900 md:py-24 md:px-8 border border-black">
			<div className="mx-auto max-w-[1400px]">
				{/* Swiss Header */}
				<div className="mb-2 flex flex-col items-start justify-between border-neutral-900 border-t-4 pt-4 pb-8 md:items-end md:pt-6 md:pb-12 md:flex-row">
					<h2 className="mb-4 font-black text-3xl uppercase leading-none tracking-tighter sm:text-5xl md:text-7xl md:mb-0">
						See Eventzflow <br /> In Action
					</h2>
				</div>

				{/* Asymmetrical Grid System */}
				<div className="grid h-auto grid-cols-1 gap-px border border-neutral-300 bg-neutral-200 md:h-[800px] md:grid-cols-2">
					{galleryImages.map((item, index) => (
						<motion.div
							key={item.id}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className={`group relative overflow-hidden bg-[#F5F5F7] hover:z-10 ${item.className} ${index > 0 ? "aspect-[16/10] md:aspect-auto" : "aspect-[4/5] md:aspect-auto"}`}
						>
							{/* Background Image */}
							<div className="absolute inset-0 transition-transform duration-700 md:group-hover:scale-105">
								<Image
									src={item.src}
									alt={item.title}
									fill
									priority={index === 0}
									className="object-cover opacity-100 transition-all duration-500 md:opacity-90 md:grayscale md:group-hover:opacity-100 md:group-hover:grayscale-0"
								/>
								<div className="absolute inset-0 bg-transparent transition-colors duration-500 md:bg-black/20 md:group-hover:bg-transparent" />
							</div>

							{/* Content Overlay */}
							<div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-10">
								{/* Top Meta: Solid Index Label */}
								<div className="flex items-start justify-between">
									<span className="flex h-7 w-7 items-center justify-center border border-black/10 bg-white font-bold font-mono text-black text-xs md:h-8 md:w-8 md:text-sm">
										{item.id}
									</span>
								</div>

								{/* Bottom Typography */}
								<div>
									<h3 className="font-black text-2xl text-white uppercase leading-none tracking-tighter mix-blend-overlay sm:text-3xl md:text-7xl">
										{item.title}
									</h3>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default GallerySection;
