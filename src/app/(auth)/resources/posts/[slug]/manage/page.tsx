"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useResource } from "@/app/(auth)/resources/layout";
import { LoadingState } from "@/components/data-state";
import { ArticleCanvas } from "@/components/pages/resources/posts/editor-page/article-canvas";
import { ResourceEditorActionButtons } from "@/components/pages/resources/posts/editor-page/page-action/action-buttons";
import { useSetResourceActions } from "@/hooks/use-set-resource-actions";
import { useResourceEditorStore } from "@/stores/resource-editor-store";

export default function PostManagePage() {
	const router = useRouter();
	const post = useResource();
	const isLoading = !post;
	const { setPreviewMode } = useResourceEditorStore();

	useEffect(() => {
		if (post?.status === "published") {
			setPreviewMode(true);
		}
	}, [post?.status, setPreviewMode]);

	const actions = useMemo(
		() => (post ? <ResourceEditorActionButtons resource={post} /> : null),
		[post],
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

	return <ArticleCanvas initialPost={post} />;
}