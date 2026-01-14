"use client";

import { List } from "lucide-react";
import type React from "react";
import { memo } from "react";
import { IconViewer } from "@/components/admin-ui/form/icon-viewer";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";
import { cn } from "@/lib/utils";

interface TopicCardProps {
	topic: ResourceTopic;
}

const TopicCard: React.FC<TopicCardProps> = memo(function TopicCard({ topic }) {
	return (
		<div className="group relative aspect-4/5 w-full cursor-pointer">
			{/* Duplicate div that stays - Optimized with CSS transition */}
			<div className="absolute inset-0 border border-white bg-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			{/* Main Topic Card - Optimized with CSS transitions */}
			<div className="relative z-50 flex h-full w-full flex-col overflow-hidden border border-white bg-transparent p-8 transition-all duration-300 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:border-black group-hover:bg-white">
				{/* Icon on top left */}
				<div className="mb-6 shrink-0">
					{topic.logo ? (
						<IconViewer
							name={topic.logo}
							className="size-24 text-white transition-colors duration-300 group-hover:text-black"
						/>
					) : (
						<List className="size-24 text-white transition-colors duration-300 group-hover:text-black" />
					)}
				</div>

				{/* Title - Always visible */}
				<div className="mt-auto">
					<h3 className="font-bold text-2xl text-white uppercase tracking-tight transition-colors duration-300 group-hover:text-black md:text-3xl">
						{topic.name}
					</h3>

					{/* Description - Optimized with CSS grid transition */}
					<div
						className={cn(
							"grid transition-all duration-300 ease-in-out",
							"grid-rows-[0fr] opacity-0",
							"group-hover:mt-2 group-hover:grid-rows-[1fr] group-hover:opacity-100",
						)}
					>
						<div className="overflow-hidden">
							<p className="text-base text-black/70 leading-relaxed md:text-lg">
								{topic.description ||
									"Explore insights and guides on this topic."}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

export default TopicCard;
