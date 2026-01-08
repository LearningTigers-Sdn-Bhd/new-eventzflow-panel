"use client";

import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemFooter,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { PostActionMenu } from "./post-action-menu";

interface PostItemProps {
	post: Resource;
	onClick?: () => void;
}

export function PostItem({ post, onClick }: PostItemProps) {
	const status = post.status;
	let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
	switch (status) {
		case "published":
			variant = "default";
			break;
		case "draft":
			variant = "secondary";
			break;
		case "pending_review":
			variant = "outline";
			break;
		case "rejected":
			variant = "destructive";
			break;
		case "archived":
			variant = "secondary";
			break;
	}

	return (
		<Item
			variant="outline"
			className={cn(
				"rounded-none",
				onClick && "cursor-pointer transition-colors hover:bg-accent/50",
			)}
			onClick={onClick}
		>
			<ItemHeader>
				<ItemTitle className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<div className="flex size-8 items-center justify-center border bg-muted">
							<FileText className="h-4 w-4 text-muted-foreground" />
						</div>
						<span className="line-clamp-2 font-medium">
							{post.title}
						</span>
					</div>
					<Badge
						variant={variant}
						className="h-5 shrink-0 text-[10px] capitalize"
					>
						{(status || "unknown").replace("_", " ")}
					</Badge>
				</ItemTitle>
			</ItemHeader>
			<ItemContent>
				<div className="flex flex-col gap-1 text-muted-foreground text-xs">
					{status === "rejected" && post.rejectionReason && (
						<div className="mb-2 rounded-none bg-destructive/10 p-2 text-destructive">
							<span className="font-semibold uppercase text-[10px]">
								Rejection Reason:
							</span>
							<p className="mt-0.5 leading-relaxed">{post.rejectionReason}</p>
						</div>
					)}
					{post.topic && <span>Topic: {post.topic.name}</span>}
					{post.category && <span>Category: {post.category.name}</span>}
					{post.mediaType && <span>Type: {post.mediaType.name}</span>}
				</div>
			</ItemContent>
			<ItemFooter className="flex items-center justify-between text-muted-foreground text-xs">
				<span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
				<ItemActions>
					<PostActionMenu post={post} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
