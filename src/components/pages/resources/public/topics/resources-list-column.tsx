"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import type { Resource } from "@/lib/api/resource";

export const resourceColumns: ColumnDef<Resource>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "title",
		header: "Resource",
		cell: ({ row }) => {
			const resource = row.original;
			return (
				<Link
					href={`/resources/${resource.slug}`}
					className="group block h-full"
				>
					<div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg">
						{/* Image */}
						<div className="relative aspect-[16/9] w-full bg-gray-100">
							{resource.coverImageUrl ? (
								<Image
									src={resource.coverImageUrl}
									alt={resource.title}
									fill
									className="object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-gray-400">
									No Image
								</div>
							)}
							{/* Topic Badge */}
							{resource.topic && (
								<div className="absolute top-4 left-4 rounded-full bg-black/70 px-3 py-1 font-medium text-white text-xs backdrop-blur-sm">
									{resource.topic.name}
								</div>
							)}
						</div>

						{/* Content */}
						<div className="flex flex-1 flex-col p-6">
							<div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
								{resource.mediaType && (
									<span className="uppercase tracking-wider">
										{resource.mediaType.name}
									</span>
								)}
								{resource.mediaType && resource.publishedAt && <span>•</span>}
								{resource.publishedAt && (
									<span>
										{new Date(resource.publishedAt).toLocaleDateString()}
									</span>
								)}
							</div>
							
							<h3 className="mb-3 font-bold text-xl text-gray-900 leading-tight group-hover:text-black/70">
								{resource.title}
							</h3>
							
							{resource.metaDescription && (
								<p className="mb-4 line-clamp-2 flex-1 text-gray-600 text-sm">
									{resource.metaDescription}
								</p>
							)}

							<div className="mt-auto flex items-center font-semibold text-black text-sm group-hover:underline">
								Read more
								<svg
									className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</div>
						</div>
					</div>
				</Link>
			);
		},
	},
];
