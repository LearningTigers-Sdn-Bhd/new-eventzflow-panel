"use client";

import { useResource } from "@/app/(auth)/resources/layout";
import { RichEditor } from "@/components/admin-ui/editor/rich-editor";
import { LoadingState } from "@/components/data-state";

export default function PostDetailPage() {
	const post = useResource();
	const isLoading = !post;

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
		<div className="mx-auto max-w-7xl">
			<RichEditor
				value={post.article || ""}
				onChange={() => {}}
				editable={false}
				hideToolbar
				className="w-full rounded-none border-none bg-transparent shadow-none"
			/>
		</div>
	);
}
