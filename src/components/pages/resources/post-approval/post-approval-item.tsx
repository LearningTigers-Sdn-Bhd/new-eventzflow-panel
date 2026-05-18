"use client";

import { FileText, User } from "lucide-react";
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
import { PostApprovalActionMenu } from "./post-approval-action-menu";

interface PostApprovalItemProps {
	post: Resource;
	onClick?: () => void;
}

export function PostApprovalItem({ post, onClick }: PostApprovalItemProps) {
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
				<ItemTitle className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center border bg-muted">
						<FileText className="h-4 w-4 text-muted-foreground" />
					</div>
					<span className="line-clamp-2 font-medium">{post.title}</span>
				</ItemTitle>
			</ItemHeader>
			<ItemContent className="space-y-2">
				<div className="flex flex-col gap-1 text-muted-foreground text-xs">
					<div className="flex items-center gap-1.5 font-medium text-foreground">
						<User className="size-3" />
						<span>{post.author?.fullName || "Unknown"}</span>
					</div>
					{post.topic && <span>Topic: {post.topic.name}</span>}
					{post.category && <span>Category: {post.category.name}</span>}
					{post.mediaType && <span>Type: {post.mediaType.name}</span>}
				</div>
			</ItemContent>
			<ItemFooter className="flex items-center justify-between text-muted-foreground text-xs">
				<span>Submitted: {new Date(post.createdAt).toLocaleDateString()}</span>
				<ItemActions>
					<PostApprovalActionMenu post={post} />
				</ItemActions>
			</ItemFooter>
		</Item>
	);
}
