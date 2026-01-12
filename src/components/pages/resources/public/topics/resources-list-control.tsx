"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import type { ResourceMediaType } from "@/lib/api/resource/media-type/response";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { LayoutGrid, List } from "lucide-react";

interface ResourcesListControlProps {
	topics: ResourceTopic[];
	categories: ResourceCategory[];
	mediaTypes: ResourceMediaType[];
	selectedTopicSlug: string;
	selectedCategorySlugs: string[];
	selectedMediaTypeSlugs: string[];
	viewMode: "grid" | "list";
	onTopicChange: (slug: string) => void;
	onCategoryChange: (slugs: string[]) => void;
	onMediaTypeChange: (slugs: string[]) => void;
	onViewModeChange: (mode: "grid" | "list") => void;
}

export function ResourcesListControl({
	topics,
	categories,
	mediaTypes,
	selectedTopicSlug,
	selectedCategorySlugs,
	selectedMediaTypeSlugs,
	viewMode,
	onTopicChange,
	onCategoryChange,
	onMediaTypeChange,
	onViewModeChange,
}: ResourcesListControlProps) {
	return (
		<div className="space-y-8">
			{/* Top: Topics Iteration */}
			<div className="flex flex-wrap gap-2">
				<Button
					variant={selectedTopicSlug === "all" ? "default" : "outline"}
					onClick={() => onTopicChange("all")}
					className="rounded-full"
				>
					All Topics
				</Button>
				{topics.map((topic) => {
					return (
						<Button
							key={topic.id}
							variant={selectedTopicSlug === topic.slug ? "default" : "outline"}
							onClick={() => onTopicChange(topic.slug)}
							className="rounded-full"
						>
							{topic.name}
						</Button>
					);
				})}
			</div>

			{/* Center: Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div className="w-full sm:w-[250px]">
					<MultiSelect
						options={categories.map((c) => ({ label: c.name, value: c.slug }))}
						selected={selectedCategorySlugs}
						onChange={onCategoryChange}
						placeholder="Filter Categories"
					/>
				</div>

				<div className="w-full sm:w-[250px]">
					<MultiSelect
						options={mediaTypes.map((t) => ({ label: t.name, value: t.slug }))}
						selected={selectedMediaTypeSlugs}
						onChange={onMediaTypeChange}
						placeholder="Filter Media Types"
					/>
				</div>
			</div>

			{/* Bottom: View Switcher */}
			<div className="flex w-full items-center justify-end border-t pt-4">
				<div className="flex items-center gap-2">
					<Label htmlFor="view-mode" className="text-sm font-medium">
						{viewMode === "grid" ? "Grid View" : "List View"}
					</Label>
					<div className="flex items-center gap-2 rounded-lg border p-1">
						<Button
							variant={viewMode === "grid" ? "secondary" : "ghost"}
							size="icon"
							className="h-8 w-8"
							onClick={() => onViewModeChange("grid")}
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="icon"
							className="h-8 w-8"
							onClick={() => onViewModeChange("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
