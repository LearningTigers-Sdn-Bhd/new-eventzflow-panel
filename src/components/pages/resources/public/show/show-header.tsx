import Image from "next/image";
import type { Resource } from "@/lib/api/resource/response";

interface ShowHeaderProps {
	resource: Resource;
}

export default function ShowHeader({ resource }: ShowHeaderProps) {
	return (
		<div className="relative h-[50vh] min-h-[500px] w-full overflow-hidden bg-black">
			{resource.coverImageUrl && (
				<Image
					src={resource.coverImageUrl}
					alt={resource.title}
					fill
					className="object-cover opacity-60"
					priority
				/>
			)}
			<div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
			<div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
				<div className="container mx-auto max-w-5xl">
					<div className="mb-4 flex flex-wrap items-center gap-3 font-medium text-sm text-white/80">
						{resource.topic && (
							<span className="rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm">
								{resource.topic.name}
							</span>
						)}
						{resource.mediaType && (
							<>
								<span>•</span>
								<span className="uppercase tracking-wider">
									{resource.mediaType.name}
								</span>
							</>
						)}
						{resource.publishedAt && (
							<>
								<span>•</span>
								<span>
									{new Date(resource.publishedAt).toLocaleDateString(undefined, {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</>
						)}
					</div>
					<h1 className="mb-6 font-black text-4xl text-white uppercase leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
						{resource.title}
					</h1>
					{resource.metaDescription && (
						<p className="max-w-3xl font-medium text-lg text-white/80 leading-relaxed md:text-xl">
							{resource.metaDescription}
						</p>
					)}
					{resource.author && (
						<div className="mt-8 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white backdrop-blur-sm">
								{resource.author.fullName.charAt(0)}
							</div>
							<div>
								<p className="font-bold text-base text-white tracking-tight">
									{resource.author.fullName}
								</p>
								<p className="font-semibold text-white/50 text-xs uppercase tracking-widest">
									Author
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
