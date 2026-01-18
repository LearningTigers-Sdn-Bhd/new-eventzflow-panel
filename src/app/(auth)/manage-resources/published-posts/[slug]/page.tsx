"use client";

import { RichDisplay } from "@/components/admin-ui/rich-editor/display/display";
import { RichDisplayContent } from "@/components/admin-ui/rich-editor/display/display-content";
import { RichDisplayOutline } from "@/components/admin-ui/rich-editor/display/display-outline";
import { LoadingState } from "@/components/data-state";
import { PostHeader } from "@/components/pages/resources/posts/show-page/post-header";
import { useResourceSidebarContext } from "@/components/sidebars/features/resources/resource-sidebar-provider";

export default function PostDetailPage() {
	const { resource: post, isLoading } = useResourceSidebarContext();

	if (isLoading) {
		return (
			<LoadingState
				title="Loading post..."
				description="Please wait while we fetch the post details..."
			/>
		);
	}

	if (!post) return null;

	return (
		<div className="h-full w-full">
			<RichDisplay
				content={post.article || ""}
				className="h-full w-full border-none shadow-none"
			>
				<RichDisplayOutline style="block" side="left" />
				<RichDisplayContent>
					<div className="w-full px-4 md:px-8">
						<PostHeader resource={post} />
					</div>
				</RichDisplayContent>
			</RichDisplay>
		</div>
	);
}
