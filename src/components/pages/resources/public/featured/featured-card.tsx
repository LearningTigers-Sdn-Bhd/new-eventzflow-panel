import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { Resource } from "@/lib/api/resource";

interface FeaturedCardProps {
	resources: Resource[];
}

export function FeaturedCard({ resources }: FeaturedCardProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);

	React.useEffect(() => {
		if (!api) return;

		setCurrent(api.selectedScrollSnap());

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	const activeResource = resources[current];

	if (!resources.length) return null;

	return (
		<div className="grid grid-cols-1 gap-0 border border-primary lg:grid-cols-3">
			<Carousel
				setApi={setApi}
				className="group w-full lg:col-span-2"
				opts={{
					loop: true,
				}}
			>
				<CarouselContent>
					{resources.map((resource, index) => (
						<CarouselItem key={resource.id}>
							<div className="relative h-[400px] w-full overflow-hidden rounded-none bg-gray-100 md:h-[500px]">
								{resource.coverImageUrl ? (
									<img
										src={resource.coverImageUrl}
										alt={resource.title}
										loading="lazy"
										decoding="async"
										className="absolute inset-0 h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-gray-400">
										No Image
									</div>
								)}
								<div className="absolute inset-0 flex flex-col justify-end bg-linear-to-tr from-black/90 via-black/50 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-8">
									<div className="mb-3 flex flex-wrap items-center gap-2">
										{resource.topic && (
											<Badge className="rounded-none border border-primary-foreground bg-transparent text-primary-foreground shadow-none hover:bg-primary-foreground/10">
												{resource.topic.name}
											</Badge>
										)}
										{resource.category && (
											<Badge className="rounded-none border border-primary-foreground bg-transparent text-primary-foreground shadow-none hover:bg-primary-foreground/10">
												{resource.category.name}
											</Badge>
										)}
										{resource.mediaType && (
											<Badge className="rounded-none border border-primary-foreground bg-transparent text-primary-foreground shadow-none hover:bg-primary-foreground/10">
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
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				{resources.length > 1 && (
					<>
						<CarouselPrevious className="left-4 rounded-none border-white/20 bg-transparent text-white opacity-0 transition-opacity duration-500 hover:bg-white/10 group-hover:opacity-100" />
						<CarouselNext className="right-4 rounded-none border-white/20 bg-transparent text-white opacity-0 transition-opacity duration-500 hover:bg-white/10 group-hover:opacity-100" />
					</>
				)}
			</Carousel>

			<div className="flex flex-col justify-center gap-6 rounded-none bg-primary p-6 text-primary-foreground lg:col-span-1">
				<div className="flex flex-col gap-2">
					<p className="font-medium text-sm uppercase tracking-wider opacity-80">
						Read More About :
					</p>
					<h2 className="line-clamp-4 font-bold text-2xl uppercase md:text-3xl">
						{activeResource?.title}
					</h2>
				</div>
				<div className="group mt-auto flex w-full flex-col gap-1">
					<Button
						asChild
						className="w-full rounded-none border border-transparent bg-background py-6 text-primary hover:border-primary-foreground hover:bg-transparent hover:text-primary-foreground group-hover:border-primary-foreground group-hover:bg-transparent group-hover:text-primary-foreground"
					>
						<Link href={`/resources/${activeResource?.slug}`}>
							Read
							<BookOpen className="h-4 w-4" />
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="w-full rounded-none border-primary-foreground bg-transparent py-6 text-primary-foreground hover:bg-primary-foreground hover:text-primary group-hover:bg-primary-foreground group-hover:text-primary"
					>
						<Link href="/resources/topics/all">
							Explore More
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
