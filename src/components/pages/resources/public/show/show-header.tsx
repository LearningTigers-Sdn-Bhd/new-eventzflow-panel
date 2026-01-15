"use client";

import { Image } from "@unpic/react";
import { BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
	FaFacebookF,
	FaInstagram,
	FaLinkedinIn,
	FaWhatsapp,
	FaXTwitter,
} from "react-icons/fa6";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { getResourceImage } from "@/lib/utils/resource-image";

interface ShowHeaderProps {
	resource: Resource;
}

export default function ShowHeader({ resource }: ShowHeaderProps) {
	const [shareUrl, setShareUrl] = useState("");
	const shareTitle = resource.title;

	useEffect(() => {
		setShareUrl(window.location.href);
	}, []);

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
			color: "hover:text-white",
		},
		{
			name: "LinkedIn",
			icon: FaLinkedinIn,
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
			color: "hover:text-blue-400",
		},
		{
			name: "Instagram",
			icon: FaInstagram,
			href: "https://www.instagram.com/",
			color: "hover:text-pink-500",
		},
		{
			name: "WhatsApp",
			icon: FaWhatsapp,
			href: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
			color: "hover:text-green-400",
		},
	];

	const displayImage = getResourceImage(resource.headerImgUrl, "large");

	return (
		<div className="relative h-[50vh] min-h-[500px] w-full overflow-hidden bg-black">
			{displayImage && (
				<Image
					src={displayImage}
					alt={resource.title}
					layout="fullWidth"
					background="auto"
					fetchpriority="high"
					loading="eager"
					className="absolute inset-0 h-full w-full object-cover opacity-60"
					suppressHydrationWarning
				/>
			)}
			<div className="absolute inset-0 bg-linear-to-t from-black/90 to-transparent" />
			<div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
				<div className="container mx-auto max-w-5xl space-y-4">
					<div className="mb-4 flex flex-wrap items-center gap-3 font-medium text-sm text-white/80">
						{resource.topic && (
							<span className="rounded-none bg-white/20 px-3 py-1 text-white backdrop-blur-sm">
								{resource.topic.name}
							</span>
						)}
						{resource.category && (
							<>
								<span>•</span>
								<span className="uppercase tracking-wider">
									{resource.category.name}
								</span>
							</>
						)}
						{resource.mediaType && (
							<>
								<span>•</span>
								<span className="uppercase tracking-wider">
									{resource.mediaType.name}
								</span>
							</>
						)}
					</div>
					<h1 className="mb-6 font-black text-4xl text-white uppercase leading-none tracking-tighter sm:text-5xl md:text-5xl">
						{resource.title}
					</h1>
					<div className="mt-8 flex flex-row items-center justify-between gap-4">
						{resource.author && (
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-none border border-white/20 bg-white/10 font-bold text-white backdrop-blur-sm">
									{resource.author.fullName.charAt(0)}
								</div>
								<div className="flex flex-col items-start justify-start">
									<div className="flex flex-row items-center gap-2">
										<p className="font-bold text-base text-white tracking-tight">
											{resource.isOfficial
												? "Eventzflow Official"
												: resource.author.fullName}
										</p>
										{resource.author.writePermission?.isOfficial && (
											<BadgeCheck className="size-4 text-white" />
										)}
									</div>
									<p className="font-semibold text-white/50 text-xs uppercase tracking-widest">
										Author
									</p>
								</div>
							</div>
						)}
						<div className="flex flex-row items-center gap-2">
							<span className="mr-2 hidden font-medium text-white/60 text-xs uppercase tracking-wider md:inline-block">
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
											"flex h-8 w-8 items-center justify-center rounded-none border border-white/20 bg-white/10 text-white/80 backdrop-blur-sm transition-colors",
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

					<div className="flex flex-row items-center gap-2">
						{resource.publishedAt && (
							<span className="font-semibold text-white/50 text-xs uppercase tracking-widest">
								{new Date(resource.publishedAt).toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
