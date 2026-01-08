"use client";

import {
	FaFacebookF,
	FaInstagram,
	FaLinkedinIn,
	FaWhatsapp,
	FaXTwitter,
} from "react-icons/fa6";
import { useMemo } from "react";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";

interface PostHeaderProps {
	resource: Resource;
	className?: string;
}

export function PostHeader({ resource, className }: PostHeaderProps) {
	const readingTime = useMemo(() => {
		if (!resource.article) return 0;
		const wordsPerMinute = 200;
		const text = resource.article.replace(/<[^>]*>/g, ""); // Strip HTML
		const wordCount = text.split(/\s+/).length;
		return Math.ceil(wordCount / wordsPerMinute);
	}, [resource.article]);

	const publishedDate = useMemo(() => {
		if (resource.status !== "published" || !resource.publishedAt) return null;
		return new Date(resource.publishedAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	}, [resource.status, resource.publishedAt]);

	const shareUrl = typeof window !== "undefined" ? window.location.href : "";
	const shareTitle = resource.title;

	const socialLinks = [
		{
			name: "Facebook",
			icon: FaFacebookF,
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
			color: "hover:text-blue-600",
		},
		{
			name: "X",
			icon: FaXTwitter,
			href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
			color: "hover:text-black",
		},
		{
			name: "LinkedIn",
			icon: FaLinkedinIn,
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
			color: "hover:text-blue-700",
		},
		{
			name: "Instagram",
			icon: FaInstagram,
			href: "https://www.instagram.com/", // Instagram doesn't have a direct share URL like others
			color: "hover:text-pink-600",
		},
		{
			name: "WhatsApp",
			icon: FaWhatsapp,
			href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
			color: "hover:text-green-500",
		},
	];

	return (
		<div className={cn("flex w-full flex-col gap-6 py-8", className)}>
			{/* Image */}
			{resource.headerImgUrl && (
				<div className="relative aspect-video w-full overflow-hidden rounded-none border bg-muted shadow-sm md:aspect-21/9">
					<img
						src={resource.headerImgUrl}
						alt={resource.title}
						className="h-full w-full object-cover"
					/>
				</div>
			)}

			<div className="flex flex-col gap-4">
				{/* Title */}
				<h1 className="text-balance font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
					{resource.title}
				</h1>

				{/* Metadata & Share */}
				<div className="flex flex-row items-center justify-between border-y py-4">
					<div className="flex flex-row items-center gap-4 text-muted-foreground text-sm">
						{publishedDate && (
							<>
								<span>{publishedDate}</span>
								<span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
							</>
						)}
						<span>{readingTime} min read</span>
					</div>

					<div className="flex flex-row items-center gap-2">
						<span className="mr-2 hidden font-medium text-muted-foreground text-xs uppercase tracking-wider md:inline-block">
							Share
						</span>
						<div className="flex items-center gap-1">
							{socialLinks.map((social) => (
								<a
									key={social.name}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-none border bg-card text-muted-foreground transition-colors",
										social.color,
									)}
									title={`Share on ${social.name}`}
								>
									<social.icon className="h-4 w-4" />
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
