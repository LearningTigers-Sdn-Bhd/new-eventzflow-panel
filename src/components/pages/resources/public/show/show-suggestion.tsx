import Image from "next/image";
import type { Resource } from "@/lib/api/resource/response";

interface ShowSuggestionProps {
	suggestions: Resource[];
}

export default function ShowSuggestion({ suggestions }: ShowSuggestionProps) {
	if (!suggestions || suggestions.length === 0) return null;

	return (
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
					{suggestions.map((suggestion) => (
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
	);
}
