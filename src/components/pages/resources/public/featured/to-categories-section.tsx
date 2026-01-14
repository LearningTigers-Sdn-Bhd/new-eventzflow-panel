"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { memo, useMemo, useState } from "react";
import { getResourceCategories } from "@/lib/api/resource";
import { SMOOTH_EASE } from "@/lib/constants/animation";
import { cn } from "@/lib/utils";

const ToCategoriesSection: React.FC = memo(function ToCategoriesSection() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const router = useRouter();

	const { data: categoriesData } = useSuspenseQuery({
		queryKey: [
			"resource-categories",
			{ filter: "active", sort: "most_published_resources", perPage: 5 },
		],
		queryFn: () =>
			getResourceCategories({
				filter: "active",
				sort: "most_published_resources",
				perPage: 5,
			}),
	});

	const categories = useMemo(() => {
		return categoriesData?.data || [];
	}, [categoriesData]);

	const handleCategoryClick = (slug: string) => {
		if (slug) {
			router.push(`/resources/topics/all?category=${slug}#top`);
		} else {
			router.push("/resources/topics/all#top");
		}
	};

	const displayItems = useMemo(() => {
		const items = categories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			slug: cat.slug,
			description: cat.description,
		}));

		if (items.length > 0) {
			items.push({
				id: "explore-more",
				name: "Explore More",
				slug: "",
				description:
					"Discover all categories and topics to find exactly what you are looking for.",
			});
		}

		return items;
	}, [categories]);

	return (
		<section id="categories" className="bg-white px-6 py-20 md:px-12 md:py-32">
			<div className="mx-auto max-w-7xl">
				<div className="grid min-h-[600px] grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
					{/* Left Side - Title */}
					<div className="lg:sticky lg:top-40 lg:col-span-4 lg:self-start">
						<div>
							<h2 className="font-black text-4xl text-black uppercase tracking-tighter sm:text-5xl md:text-7xl">
								<span className="bg-sky-500 text-white">EXPLORE</span>
								<br />
								CATEGORIES.
							</h2>
							<div className="my-4 h-1 w-12 bg-black/20 md:my-6" />
							<p className="text-black/70 text-lg leading-relaxed md:text-xl">
								Discover expert insights, practical guides, and industry news
								categorized by categories to help you grow your events.
							</p>
						</div>
					</div>

					{/* Middle - Spacer */}
					<div className="hidden lg:col-span-1 lg:block" />

					{/* Right Side - Category Items */}
					<div className="lg:col-span-7">
						{displayItems.map((item, i) => (
							<motion.div
								key={item.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-100px" }}
								transition={{
									duration: 0.6,
									delay: i * 0.1,
									ease: SMOOTH_EASE,
								}}
								onMouseEnter={() => setHoveredIndex(i)}
								onMouseLeave={() => setHoveredIndex(null)}
								className={cn(
									"group relative cursor-pointer overflow-hidden border-black/10 border-b transition-all duration-300 ease-in-out",
									hoveredIndex === i && "border-black bg-black text-white",
								)}
								onClick={() => handleCategoryClick(item.slug)}
							>
								<div className="flex w-full items-start justify-between gap-8 px-6 py-8 text-left">
									<div className="flex items-start gap-6">
										<span
											className={cn(
												"pt-1 font-bold text-sm transition-colors duration-300",
												hoveredIndex === i ? "text-white/40" : "text-black/40",
											)}
										>
											{i < 9 ? `0${i + 1}` : i + 1}
										</span>
										<div className="flex flex-col gap-2">
											<div className="flex items-center gap-4">
												<div className="relative">
													<h3
														className={cn(
															"font-bold text-xl uppercase leading-tight tracking-tight transition-colors duration-300 md:text-2xl",
															hoveredIndex === i ? "text-white" : "text-black",
														)}
													>
														{item.name}
													</h3>
													{/* Optimized underline with CSS transform */}
													<div
														className={cn(
															"absolute bottom-0 left-0 h-[2px] w-full origin-left transition-all duration-300 ease-in-out",
															hoveredIndex === i
																? "scale-x-100 bg-white"
																: "scale-x-0 bg-black",
														)}
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Optimized Arrow with CSS transitions */}
									<div className="mt-1 min-w-[24px] shrink-0">
										<ArrowUpRight
											className={cn(
												"h-6 w-6 text-white transition-all duration-200 ease-in-out",
												hoveredIndex === i
													? "translate-x-0 translate-y-0 scale-100 opacity-100"
													: "-translate-x-2 translate-y-2 scale-50 opacity-0",
											)}
										/>
									</div>
								</div>

								{/* Optimized description with CSS grid */}
								<div
									className={cn(
										"grid transition-all duration-300 ease-in-out",
										hoveredIndex === i
											? "grid-rows-[1fr] opacity-100"
											: "grid-rows-[0fr] opacity-0",
									)}
								>
									<div className="overflow-hidden">
										<div className="px-6 pb-8 pl-12 md:pl-14">
											<p className="text-left text-base text-white/60 leading-relaxed md:text-lg">
												{item.description ||
													"Explore resources and articles in this category."}
											</p>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
});

export default ToCategoriesSection;
