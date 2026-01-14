import { Image } from "@unpic/react";
import {
	ArrowUpRight,
	BookOpen,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel";
import type { Resource } from "@/lib/api/resource";
import { cn } from "@/lib/utils";

interface FeaturedCardProps {
	resources: Resource[];
}

export const FeaturedCard = React.memo(function FeaturedCard({
	resources,
}: FeaturedCardProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);

	const onSelect = React.useCallback((api: CarouselApi) => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);

	React.useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("select", () => onSelect(api));
		api.on("reInit", () => onSelect(api));
	}, [api, onSelect]);

	// Memoize active resource to avoid unnecessary recalculations
	const activeResource = React.useMemo(
		() => resources[current],
		[resources, current],
	);

	if (!resources.length) return null;

	return (
		<div className="group/card grid grid-cols-1 gap-0 border border-black lg:grid-cols-3">
			<Carousel
				setApi={setApi}
				className="w-full lg:col-span-2"
				opts={{
					loop: true,
				}}
			>
				<CarouselContent>
					{resources.map((resource) => (
						<CarouselItem key={resource.id}>
							<Link
								href={`/resources/${resource.slug}`}
								prefetch={true}
								className="relative block h-[400px] w-full overflow-hidden rounded-none bg-gray-100 md:h-[500px]"
							>
								{resource.headerImgUrl ? (
									<Image
										src={resource.headerImgUrl}
										alt={resource.title}
										layout="fullWidth"
										background="auto"
										fetchpriority="high"
										loading="eager"
										className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover/card:scale-105"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-gray-400">
										No Image
									</div>
								)}
								<div className="absolute inset-0 flex flex-col justify-end bg-linear-to-tr from-black/90 via-black/50 to-transparent p-6 opacity-0 transition-opacity duration-300 will-change-opacity group-hover/card:opacity-100 md:p-8">
									<div className="mb-3 flex flex-wrap items-center gap-2">
										{resource.topic && (
											<Badge className="rounded-none border border-white bg-transparent text-white shadow-none hover:bg-white/10">
												{resource.topic.name}
											</Badge>
										)}
										{resource.category && (
											<Badge className="rounded-none border border-white bg-transparent text-white shadow-none hover:bg-white/10">
												{resource.category.name}
											</Badge>
										)}
										{resource.mediaType && (
											<Badge className="rounded-none border border-white bg-transparent text-white shadow-none hover:bg-white/10">
												{resource.mediaType.name}
											</Badge>
										)}
									</div>
									<div className="flex flex-col gap-2">
										<h3 className="line-clamp-2 font-bold text-2xl text-white uppercase md:text-3xl">
											{resource.title}
										</h3>
										{resource.metaDescription && (
											<p className="line-clamp-2 text-sm text-white/80 md:text-base">
												{resource.metaDescription}
											</p>
										)}
									</div>
								</div>
							</Link>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Custom Navigation */}
				{resources.length > 1 && (
					<>
						<button
							type="button"
							onClick={() => api?.scrollPrev()}
							className={cn(
								"absolute top-1/2 left-4 z-50 -translate-y-1/2 cursor-pointer text-white/70 transition-all duration-300 hover:text-white group-hover/card:opacity-100",
								!canScrollPrev ? "pointer-events-none opacity-0" : "opacity-0",
							)}
							disabled={!canScrollPrev}
						>
							<ChevronLeft className="size-12" />
						</button>
						<button
							type="button"
							onClick={() => api?.scrollNext()}
							className={cn(
								"absolute top-1/2 right-4 z-50 -translate-y-1/2 cursor-pointer text-white/70 transition-all duration-300 hover:text-white group-hover/card:opacity-100",
								!canScrollNext ? "pointer-events-none opacity-0" : "opacity-0",
							)}
							disabled={!canScrollNext}
						>
							<ChevronRight className="size-12" />
						</button>
					</>
				)}
			</Carousel>

			<div className="flex flex-col justify-center gap-6 rounded-none bg-black p-6 text-white lg:col-span-1">
				<div className="flex flex-col gap-2">
					<p className="font-medium text-sm uppercase tracking-wider opacity-80">
						Read More About :
					</p>
					<h2 className="line-clamp-4 font-bold text-2xl uppercase md:text-3xl">
						{activeResource?.title}
					</h2>
				</div>
				<div className="group/buttons mt-auto flex w-full flex-col gap-1">
					<Button
						asChild
						className="w-full rounded-none border border-white bg-white py-6 text-black transition-all duration-300 hover:bg-transparent! hover:text-white! group-hover/buttons:bg-transparent group-hover/buttons:text-white"
					>
						<Link href={`/resources/${activeResource?.slug}`}>
							Read
							<BookOpen className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						asChild
						className="w-full rounded-none border border-white bg-transparent py-6 text-white transition-all duration-300 hover:bg-white! hover:text-black! group-hover/buttons:bg-white group-hover/buttons:text-black"
					>
						<Link href="/resources/topics/all#top">
							Explore More
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
});
