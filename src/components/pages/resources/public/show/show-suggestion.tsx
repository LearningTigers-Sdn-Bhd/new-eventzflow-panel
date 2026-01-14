import type { Resource } from "@/lib/api/resource/response";
import { ResourcesCard } from "../resources-card";

interface ShowSuggestionProps {
	suggestions: Resource[];
}

export default function ShowSuggestion({ suggestions }: ShowSuggestionProps) {
	if (!suggestions || suggestions.length === 0) return null;

	return (
		<div className="border-t bg-gray-50 py-20">
			<div className="container mx-auto max-w-7xl px-4">
				<div className="mb-12 flex items-end justify-between">
					<div>
						<p className="mb-2 font-bold text-gray-500 text-xs uppercase tracking-[0.3em]">
							More Insights
						</p>
						<h2 className="font-black text-3xl text-gray-900 uppercase tracking-tighter sm:text-4xl">
							Related Content
						</h2>
					</div>
				</div>
				<div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-3">
					{suggestions.map((suggestion) => (
						<ResourcesCard
							key={suggestion.id}
							resource={suggestion}
							layout="grid"
						/>
					))}
				</div>
			</div>
		</div>
	);
}
