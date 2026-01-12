"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import { getResourceTopics } from "@/lib/api/resource/topic/endpoints";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { SMOOTH_EASE } from "@/lib/constants/animation";
import { cn } from "@/lib/utils";
import TopicCard from "./topic-card";

export default function ToTopicsSection() {
	const router = useRouter();
	const [api, setApi] = useState<CarouselApi>();
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const { data: topicsData, isLoading } = useQuery({
		queryKey: ["resource-topics", { filter: "active" }],
		queryFn: () => getResourceTopics({ filter: "active" }),
	});

	const topics = useMemo(() => {
		const fetchedTopics = topicsData?.data || [];
		const allTopicsItem: ResourceTopic = {
			id: "all",
			name: "All Topics",
			slug: "all",
			description:
				"Browse all topics and find exactly what you're looking for.",
			logo: "Layout",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deletedAt: null,
		};
		return [allTopicsItem, ...fetchedTopics];
	}, [topicsData]);

	const handleTopicClick = (slug: string) => {
		router.push(`/resources/topics/${slug}`);
	};

	const onSelect = useCallback((api: CarouselApi) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);

	useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("select", () => onSelect(api));
		api.on("reInit", () => onSelect(api));
	}, [api, onSelect]);

	return (
		<section className="bg-black px-6 py-20 md:py-28">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, ease: SMOOTH_EASE }}
					>
						<p className="mb-4 font-medium text-white/40 text-xs uppercase tracking-[0.3em]">
							Explore variety of
						</p>
						<h2 className="font-bold text-3xl text-white uppercase tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
							Topics
						</h2>
					</motion.div>
				</div>

				{/* Carousel */}
				<div className="relative w-full">
					{isLoading ? (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className={cn(
										"aspect-4/5 animate-pulse border border-white/10 bg-white/5",
										i % 2 !== 0 ? "-translate-y-4" : "translate-y-4",
									)}
								/>
							))}
						</div>
					) : (
						<div className="relative px-18">
							<Carousel
								setApi={setApi}
								opts={{
									align: "start",
									loop: false,
								}}
								className="w-full"
							>
								<CarouselContent className="select-none py-18">
									{topics.map((topic, index) => (
										<CarouselItem
											key={topic.id}
											className="pl-4 sm:basis-1/2 md:basis-1/3 md:pl-6"
											onClick={() => handleTopicClick(topic.slug)}
										>
											<div
												className={cn(
													"transition-transform duration-500",
													index % 2 === 0 ? "-translate-y-4" : "translate-y-4",
												)}
											>
												<TopicCard topic={topic} />
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
							</Carousel>

							{/* Custom Navigation */}
							<button
								type="button"
								onClick={() => api?.scrollPrev()}
								className={cn(
									"absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer text-white/70 transition-all duration-300 hover:text-white",
									!canScrollPrev && "pointer-events-none opacity-0",
								)}
								disabled={!canScrollPrev}
							>
								<ChevronLeft className="size-12" />
							</button>
							<button
								type="button"
								onClick={() => api?.scrollNext()}
								className={cn(
									"absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer text-white/70 transition-all duration-300 hover:text-white",
									!canScrollNext && "pointer-events-none opacity-0",
								)}
								disabled={!canScrollNext}
							>
								<ChevronRight className="size-12" />
							</button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
