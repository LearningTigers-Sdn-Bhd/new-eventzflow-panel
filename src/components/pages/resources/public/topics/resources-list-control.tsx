"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
	DesktopView,
	MobileTabletView,
} from "@/components/admin-ui/layout/responsive-layout";
import { Button } from "@/components/ui/button";
import type { ResourceCategory } from "@/lib/api/resource/category/response";
import type { ResourceMediaType } from "@/lib/api/resource/media-type/response";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import {
	ResourcesCloseFilterButton,
	ResourcesFilterButton,
	ResourcesFilterSelect,
	ResourcesSearchInput,
	ResourcesTopicButton,
	ResourcesViewSwitcher,
} from "./resources-list-components";

interface ResourcesListControlProps {
	topics: ResourceTopic[];
	categories: ResourceCategory[];
	mediaTypes: ResourceMediaType[];
	selectedTopicSlug: string;
	selectedCategorySlugs: string[];
	selectedMediaTypeSlugs: string[];
	searchQuery: string;
	viewMode: "grid" | "list";
	onTopicChange: (slug: string) => void;
	onCategoryChange: (slugs: string[]) => void;
	onMediaTypeChange: (slugs: string[]) => void;
	onSearchChange: (query: string) => void;
	onViewModeChange: (mode: "grid" | "list") => void;
	onClearFilters?: () => void;
}

export function ResourcesListControl({
	topics,
	categories,
	mediaTypes,
	selectedTopicSlug,
	selectedCategorySlugs,
	selectedMediaTypeSlugs,
	searchQuery,
	viewMode,
	onTopicChange,
	onCategoryChange,
	onMediaTypeChange,
	onSearchChange,
	onViewModeChange,
	onClearFilters,
}: ResourcesListControlProps) {
	const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

	return (
		<>
			{/* Desktop View */}
			<DesktopView>
				<div className="flex flex-col gap-6">
					{/* Top: Topics Iteration */}
					<div className="flex flex-wrap items-center gap-2 border-black border-b pb-6">
						<ResourcesTopicButton
							label="All Topics"
							isSelected={selectedTopicSlug === "all"}
							onClick={() => onTopicChange("all")}
						/>
						{topics.map((topic) => (
							<ResourcesTopicButton
								key={topic.id}
								label={topic.name}
								isSelected={selectedTopicSlug === topic.slug}
								onClick={() => onTopicChange(topic.slug)}
							/>
						))}
					</div>

					{/* Bottom: Search & Filters */}
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
						{/* Clear Filters Button (Desktop) - Only show when filters are active */}
						{(searchQuery ||
							selectedCategorySlugs.length > 0 ||
							selectedMediaTypeSlugs.length > 0) &&
							onClearFilters && (
								<Button
									onClick={onClearFilters}
									className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-none border border-black bg-red-600 px-4 font-medium text-white shadow-none transition-all hover:bg-red-700"
								>
									<X className="h-4 w-4" />
									<span className="hidden xl:inline">Clear</span>
								</Button>
							)}

						{/* Search Input */}
						<ResourcesSearchInput
							value={searchQuery}
							onChange={onSearchChange}
						/>

						{/* Filters Group */}
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
							<ResourcesFilterSelect
								value={selectedCategorySlugs}
								onChange={onCategoryChange}
								placeholder="Category"
								options={categories.map((c) => ({
									label: c.name,
									value: c.slug,
								}))}
							/>

							<ResourcesFilterSelect
								value={selectedMediaTypeSlugs}
								onChange={onMediaTypeChange}
								placeholder="Media Type"
								options={mediaTypes.map((t) => ({
									label: t.name,
									value: t.slug,
								}))}
							/>

							{/* View Switcher */}
							<ResourcesViewSwitcher
								viewMode={viewMode}
								onChange={onViewModeChange}
							/>
						</div>
					</div>
				</div>
			</DesktopView>

			{/* Mobile/Tablet View */}
			<MobileTabletView>
				<div className="space-y-4">
					{/* Swipeable Topics - Always visible */}
					<div className="scrollbar-hide -mx-4 mb-2 flex w-[calc(100%+2rem)] overflow-x-auto px-4 pb-2">
						<div className="flex min-w-max gap-2">
							<ResourcesTopicButton
								label="All Topics"
								isSelected={selectedTopicSlug === "all"}
								onClick={() => onTopicChange("all")}
							/>
							{topics.map((topic) => (
								<ResourcesTopicButton
									key={topic.id}
									label={topic.name}
									isSelected={selectedTopicSlug === topic.slug}
									onClick={() => onTopicChange(topic.slug)}
								/>
							))}
						</div>
					</div>

					{!isMobileFilterOpen ? (
						<div className="flex flex-col gap-4">
							<ResourcesFilterButton
								onClick={() => setIsMobileFilterOpen(true)}
								label="Filter Resources"
							/>
						</div>
					) : (
						<div className="fade-in slide-in-from-top-2 flex animate-in flex-col gap-4 duration-200">
							<ResourcesSearchInput
								value={searchQuery}
								onChange={onSearchChange}
								placeholder="Search resources..."
							/>

							<div className="flex gap-2">
								<ResourcesFilterSelect
									value={selectedCategorySlugs}
									onChange={onCategoryChange}
									placeholder="Category"
									options={categories.map((c) => ({
										label: c.name,
										value: c.slug,
									}))}
								/>
								<ResourcesFilterSelect
									value={selectedMediaTypeSlugs}
									onChange={onMediaTypeChange}
									placeholder="Media Type"
									options={mediaTypes.map((t) => ({
										label: t.name,
										value: t.slug,
									}))}
								/>
							</div>

							<div className="grid grid-cols-2 gap-2">
								{onClearFilters && (
									<Button
										onClick={onClearFilters}
										className="h-10 cursor-pointer rounded-none border border-black bg-red-600 font-medium text-white shadow-none transition-all hover:bg-red-700"
									>
										Clear All
									</Button>
								)}
								<ResourcesCloseFilterButton
									onClick={() => setIsMobileFilterOpen(false)}
								/>
							</div>
						</div>
					)}
				</div>
			</MobileTabletView>
		</>
	);
}
