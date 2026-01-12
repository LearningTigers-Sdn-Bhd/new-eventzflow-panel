"use client";

import { Archive, Copy, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useResourceMutations } from "@/hooks/resources/use-resource-mutations";
import {
	deleteResource,
	duplicateResource,
	forceDeleteResource,
	restoreResource,
} from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";

interface PostActionMenuProps {
	post: Resource;
}

export function PostActionMenu({ post }: PostActionMenuProps) {
	const { handleArchive, handleDelete, handleRestore, handleDuplicate } =
		useResourceMutations({
			resourceName: "Post",
			queryKey: ["resources"],
			archiveFn: deleteResource,
			deleteFn: forceDeleteResource,
			restoreFn: restoreResource,
			duplicateFn: duplicateResource,
		});

	const isDeleted = !!post.deletedAt;
	const isPublished = post.status === "published";

	return (
		<ButtonGroup>
			{!isDeleted && (
				<>
					{!isPublished && (
						<Button
							asChild
							size="icon-sm"
							variant="outline"
							className="rounded-none text-blue-500 hover:bg-blue-50 hover:text-blue-600 [&_svg]:text-blue-500 hover:[&_svg]:text-blue-600"
							title="Edit Post"
						>
							<Link href={`/manage-resources/posts/${post.slug}/manage` as Route}>
								<Pencil className="size-4" />
							</Link>
						</Button>
					)}
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 [&_svg]:text-indigo-500 hover:[&_svg]:text-indigo-600"
						onClick={() => handleDuplicate(post.id)}
						title="Duplicate Post"
					>
						<Copy className="size-4" />
					</Button>
					{!isPublished && (
						<Button
							size="icon-sm"
							variant="outline"
							className="rounded-none text-amber-500 hover:bg-amber-50 hover:text-amber-600 [&_svg]:text-amber-500 hover:[&_svg]:text-amber-600"
							onClick={() => handleArchive(post.id)}
							title="Archive Post"
						>
							<Archive className="size-4" />
						</Button>
					)}
				</>
			)}

			{isDeleted && (
				<>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-green-500 hover:bg-green-50 hover:text-green-600 [&_svg]:text-green-500 hover:[&_svg]:text-green-600"
						onClick={() => handleRestore(post.id)}
						title="Restore Post"
					>
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="icon-sm"
						variant="outline"
						className="rounded-none text-red-500 hover:bg-red-50 hover:text-red-600 [&_svg]:text-red-500 hover:[&_svg]:text-red-600"
						onClick={() => handleDelete(post.id)}
						title="Delete Permanently"
					>
						<Trash2 className="size-4" />
					</Button>
				</>
			)}
		</ButtonGroup>
	);
}
