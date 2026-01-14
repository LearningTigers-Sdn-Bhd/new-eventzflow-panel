import { Image } from "@unpic/react";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";

interface ResourcesCardProps {
	resource: Resource;
	layout: "grid" | "list";
	className?: string;
}

const getMediaTypeColor = (type?: string) => {
	switch (type?.toLowerCase()) {
		case "video":
			return "bg-red-500 hover:bg-red-600 text-white border-transparent";
		case "article":
			return "bg-blue-500 hover:bg-blue-600 text-white border-transparent";
		case "podcast":
			return "bg-purple-500 hover:bg-purple-600 text-white border-transparent";
		case "webinar":
			return "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent";
		default:
			return "bg-white text-black hover:bg-white/90 border-transparent";
	}
};

export const ResourcesCard = memo(function ResourcesCard({
	resource,
	layout,
	className,
}: ResourcesCardProps) {
	const {
		title,
		metaDescription,
		headerImgUrl,
		topic,
		category,
		mediaType,
		minRead,
		publishedAt,
		slug,
	} = resource;

	const displayImage = headerImgUrl;
	const dateDisplay = publishedAt
		? format(new Date(publishedAt), "MMM d, yyyy")
		: "Recently";

	if (layout === "grid") {
		return (
			<Link
				href={`/resources/${slug}`}
				prefetch={true}
				className={cn("group block h-full", className)}
			>
				<div className="relative flex h-full flex-col overflow-hidden rounded-none bg-card">
					<div
						className={cn(
							"relative -mb-px aspect-3/2 w-full overflow-hidden bg-black sm:aspect-4/3",
							!displayImage && "bg-black",
						)}
					>
						{" "}
						{displayImage ? (
							<div className="absolute inset-0 h-[101%] w-[101%] transition-transform duration-700 group-hover:scale-110">
								<Image
									src={displayImage}
									alt={title}
									layout="constrained"
									width={600}
									height={400}
									background="auto"
									className="absolute inset-0 h-full w-full object-cover"
								/>
								<div className="absolute inset-0 h-full w-full bg-linear-to-t from-black/90 via-black/40 to-transparent" />
							</div>
						) : null}
						<div className="absolute top-4 right-4 z-10">
							<Badge
								className={cn(
									"rounded-none font-semibold",
									getMediaTypeColor(mediaType?.name),
								)}
							>
								{mediaType?.name || "Resource"}
							</Badge>
						</div>
						<div className="absolute right-0 bottom-0 left-0 flex flex-col gap-4 p-6 text-white">
							<div className="flex flex-wrap gap-2">
								{topic && (
									<Badge
										variant="outline"
										className="rounded-none border-white/30 bg-white/10 text-white backdrop-blur-md"
									>
										{topic.name}
									</Badge>
								)}
								{category && (
									<Badge
										variant="outline"
										className="rounded-none border-white/30 bg-white/10 text-white backdrop-blur-md"
									>
										{category.name}
									</Badge>
								)}
							</div>

							<div className="flex flex-col gap-2">
								<h3 className="line-clamp-2 font-bold text-xl leading-tight">
									{title}
								</h3>
								{metaDescription && (
									<p className="line-clamp-2 font-medium text-sm text-white/70">
										{metaDescription}
									</p>
								)}
							</div>

							<div className="flex items-center gap-4 font-semibold text-white/60 text-xs uppercase tracking-wider">
								{minRead ? (
									<div className="flex items-center gap-1.5">
										<Clock className="h-3.5 w-3.5" />
										<span>{minRead} min read</span>
									</div>
								) : null}
								<div className="flex items-center gap-1.5">
									<Calendar className="h-3.5 w-3.5" />
									<span>{dateDisplay}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<Link
			href={`/resources/${slug}`}
			prefetch={true}
			className={cn("group block w-full", className)}
		>
			<div className="flex h-auto flex-col gap-0 overflow-hidden rounded-none border bg-card shadow-sm sm:h-56 sm:flex-row sm:gap-8">
				<div
					className={cn(
						"relative h-56 w-full shrink-0 overflow-hidden sm:h-full sm:w-80",
						!displayImage && "bg-black",
					)}
				>
					{displayImage ? (
						<div className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105">
							<Image
								src={displayImage}
								alt={title}
								layout="constrained"
								width={600}
								height={400}
								background="auto"
								className="absolute inset-0 h-full w-full object-cover"
							/>
						</div>
					) : null}
					<div className="absolute inset-0 bg-black/5 transition-colors duration-300 group-hover:bg-transparent" />

					<div className="absolute top-4 left-4 z-10">
						<Badge
							className={cn(
								"rounded-none font-semibold shadow-lg",
								getMediaTypeColor(mediaType?.name),
							)}
						>
							{mediaType?.name || "Resource"}
						</Badge>
					</div>
				</div>

				<div className="flex min-w-0 flex-1 flex-col justify-center p-6 sm:py-8 sm:pr-8">
					<div className="mb-4 flex flex-wrap gap-2">
						{topic && (
							<Badge className="rounded-none bg-black font-medium text-white hover:bg-black/80">
								{topic.name}
							</Badge>
						)}
						{category && (
							<Badge className="rounded-none bg-black font-medium text-white hover:bg-black/80">
								{category.name}
							</Badge>
						)}
					</div>

					<div className="mb-6 flex flex-col gap-2">
						<h3 className="line-clamp-1 font-bold text-2xl text-foreground">
							{title}
						</h3>
						{metaDescription && (
							<p className="line-clamp-2 text-base text-muted-foreground leading-relaxed">
								{metaDescription}
							</p>
						)}
					</div>

					<div className="mt-auto flex items-center gap-6 font-medium text-muted-foreground text-sm sm:mt-0">
						{minRead ? (
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-primary/70" />
								<span>{minRead} min read</span>
							</div>
						) : null}
						<div className="flex items-center gap-2">
							<Calendar className="h-4 w-4 text-primary/70" />
							<span>{dateDisplay}</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
});
