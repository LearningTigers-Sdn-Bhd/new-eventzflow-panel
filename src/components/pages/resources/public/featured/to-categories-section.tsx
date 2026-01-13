"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";
import { getResourceCategories } from "@/lib/api/resource";
import { SMOOTH_EASE } from "@/lib/constants/animation";

const ToCategoriesSection: React.FC = () => {
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
			router.push(`/resources/topics/all?category=${slug}`);
		} else {
			router.push("/resources/topics/all");
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
								layout
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
								className={`relative cursor-pointer overflow-hidden border-black/10 transition-colors duration-300 ${
									hoveredIndex === i
										? "border-black bg-black text-white"
										: "border-black/10 border-b text-black"
								}`}
								onClick={() => handleCategoryClick(item.slug)}
							>
								<div className="flex w-full items-start justify-between gap-8 px-6 py-8 text-left transition-colors">
									<div className="flex items-start gap-6">
										<span
											className={`pt-1 font-bold text-sm transition-colors ${
												hoveredIndex === i ? "text-white/40" : "text-black/40"
											}`}
										>
											{i < 9 ? `0${i + 1}` : i + 1}
										</span>
										<div className="flex flex-col gap-2">
											<div className="flex items-center gap-4">
												<div className="group relative">
													<h3
														className={`font-bold text-xl uppercase leading-tight tracking-tight transition-colors md:text-2xl ${
															hoveredIndex === i ? "text-white" : "text-black"
														}`}
													>
														{item.name}
													</h3>
													{/* Underline effect left to right */}
													<motion.div
														initial={{ scaleX: 0 }}
														animate={{ scaleX: hoveredIndex === i ? 1 : 0 }}
														className={`absolute bottom-0 left-0 h-[2px] w-full origin-left transition-colors ${
															hoveredIndex === i ? "bg-white" : "bg-black"
														}`}
														transition={{ duration: 0.3, ease: "easeInOut" }}
													/>
												</div>
											</div>
										</div>
									</div>

									{/* Arrow Right Top on Hover */}
									<div className="mt-1 min-w-[24px] shrink-0">
										<AnimatePresence>
											{hoveredIndex === i && (
												<motion.div
													initial={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
													animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
													exit={{ opacity: 0, scale: 0.5, x: -10, y: 10 }}
													transition={{ duration: 0.2 }}
												>
													<ArrowUpRight className="h-6 w-6 text-white" />
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>

								{/* Hover content - description */}
								<AnimatePresence>
									{hoveredIndex === i && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
											className="overflow-hidden"
										>
											<div className="px-6 pb-8 pl-12 md:pl-14">
												<p className="text-left text-base text-white/60 leading-relaxed md:text-lg">
													{item.description ||
														"Explore resources and articles in this category."}
												</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default ToCategoriesSection;
