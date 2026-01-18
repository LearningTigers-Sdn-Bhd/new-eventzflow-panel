"use client";

import { useMemo, useState } from "react";
import { LoadingState } from "@/components/data-state";
import { ArticleCanvas } from "@/components/pages/resources/posts/editor-page/article-canvas";
import { ResourceEditorActionButtons } from "@/components/pages/resources/posts/editor-page/page-action/action-buttons";
import { useResourceSidebarContext } from "@/components/sidebars/features/resources/resource-sidebar-provider";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";

export default function PostManagePage() {
	const { resource: post, isLoading } = useResourceSidebarContext();
	const [isPreviewMode, setPreviewMode] = useState(false);

	const actions = useMemo(
		() =>
			post ? (
				<ResourceEditorActionButtons
					resource={post}
					isPreviewMode={isPreviewMode}
					onTogglePreviewMode={() => setPreviewMode((prev) => !prev)}
				/>
			) : null,
		[post, isPreviewMode],
	);
	useSetResourceActions(actions);

	// Note: error handling is handled by layout or could be added here if needed

	if (isLoading) {
		return (
			<LoadingState
				title="Loading editor..."
				description="Please wait while we fetch the post for editing..."
			/>
		);
	}

	if (!post) return null;

	return (
		<ArticleCanvas
			key={post.id}
			initialPost={post}
			isPreviewMode={isPreviewMode}
		/>
	);
}
