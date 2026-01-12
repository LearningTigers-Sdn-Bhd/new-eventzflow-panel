import { cookies } from "next/headers";
import Image from "next/image";
import ShowLayout from "@/components/pages/resources/public/show-layout";
import { getPublicResourceBySlug } from "@/lib/api/resource/endpoints";
import ResourceViewTracker from "./view-tracker";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const resource = await getPublicResourceBySlug(slug);
	return {
		title: `${resource.title} - EventzFlow`,
		description: resource.metaDescription,
		openGraph: {
			images: resource.coverImageUrl ? [resource.coverImageUrl] : [],
		},
	};
}

export default async function ResourcePage({ params }: PageProps) {
	const { slug } = await params;
	const resource = await getPublicResourceBySlug(slug);

	// Check access cookie
	const cookieStore = await cookies();
	const hasAccessCookie = cookieStore.get(`resource-access-${resource.id}`);
	const hasAccess = !resource.isGated || !!hasAccessCookie;

	if (!hasAccess) {
		return <ShowLayout resource={resource} onSuccess={() => {}} />;
	}

	return (
		<main className="min-h-screen bg-white">
			<ResourceViewTracker resourceId={resource.id} />

			{/* Hero / Header */}
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
										{new Date(resource.publishedAt).toLocaleDateString(
											undefined,
											{
												year: "numeric",
												month: "long",
												day: "numeric",
											},
										)}
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

			{/* JSON Response Display Section */}
			<div className="container mx-auto max-w-7xl px-4 py-16">
				<div className="overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
					<div className="mb-6 flex items-center gap-2 border-slate-800 border-b pb-4">
						<div className="h-3 w-3 rounded-full bg-red-500" />
						<div className="h-3 w-3 rounded-full bg-yellow-500" />
						<div className="h-3 w-3 rounded-full bg-green-500" />
						<span className="ml-4 font-mono text-slate-400 text-xs uppercase tracking-widest">
							Resource Data Response
						</span>
					</div>
					<pre className="font-mono text-blue-300 text-sm leading-relaxed">
						{JSON.stringify(resource, null, 2)}
					</pre>
				</div>
			</div>

			{/* Suggestions */}
			{resource.suggestions && resource.suggestions.length > 0 && (
				<div className="mt-12 border-t bg-gray-50 py-20">
					<div className="container mx-auto max-w-7xl px-4">
						<div className="mb-12 flex items-end justify-between">
							<div>
								<p className="mb-2 font-bold text-primary text-xs uppercase tracking-[0.3em]">
									More Insights
								</p>
								<h2 className="font-black text-3xl text-gray-900 uppercase tracking-tighter sm:text-4xl">
									Related Content
								</h2>
							</div>
						</div>
						<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
							{resource.suggestions.map((suggestion) => (
								<a
									key={suggestion.id}
									href={`/resources/${suggestion.slug}`}
									className="group block"
								>
									<div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-xl border bg-gray-200 shadow-sm">
										{suggestion.coverImageUrl ? (
											<Image
												src={suggestion.coverImageUrl}
												alt={suggestion.title}
												fill
												className="object-cover transition-transform duration-700 ease-[0.165,0.84,0.44,1] group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-gray-400">
												No Image
											</div>
										)}
									</div>
									<div className="space-y-3">
										<div className="flex items-center gap-2 font-bold text-[10px] text-primary uppercase tracking-[0.2em]">
											<span>{suggestion.topic?.name}</span>
										</div>
										<h3 className="font-bold text-gray-900 text-xl leading-tight transition-colors group-hover:text-primary">
											{suggestion.title}
										</h3>
										{suggestion.metaDescription && (
											<p className="line-clamp-2 text-gray-500 text-sm leading-relaxed">
												{suggestion.metaDescription}
											</p>
										)}
									</div>
								</a>
							))}
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
