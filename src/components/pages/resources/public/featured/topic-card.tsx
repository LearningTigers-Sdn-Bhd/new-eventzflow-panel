"use client";

import { motion } from "framer-motion";
import { List } from "lucide-react";
import type React from "react";
import { IconViewer } from "@/components/admin-ui/form/icon-viewer";
import type { ResourceTopic } from "@/lib/api/resource/topic/response";

interface TopicCardProps {
	topic: ResourceTopic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
	return (
		<div className="group relative aspect-4/5 w-full cursor-pointer">
			{/* Duplicate div that stays */}
			<div className="absolute inset-0 border border-white bg-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

			{/* Main Topic Card */}
			<motion.div
				className="relative z-50 flex h-full w-full flex-col overflow-hidden border border-white bg-transparent p-8 transition-all duration-300 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:border-black group-hover:bg-white"
				initial="initial"
				whileHover="hover"
			>
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

					{/* Description - Transition bottom to top on hover */}
					<div className="overflow-hidden">
						<motion.div
							variants={{
								initial: { height: 0, opacity: 0, marginTop: 0 },
								hover: { height: "auto", opacity: 1, marginTop: 8 },
							}}
							transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
						>
							<p className="text-base text-black/70 leading-relaxed md:text-lg">
								{topic.description ||
									"Explore insights and guides on this topic."}
							</p>
						</motion.div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default TopicCard;
