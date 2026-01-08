"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ContentOutline } from "@/components/admin-ui/editor/content-outline";
import {
	RichEditor,
	useRichEditor,
} from "@/components/admin-ui/editor/rich-editor";
import { Toolbar } from "@/components/admin-ui/editor/toolbar";
import { updateResource } from "@/lib/api/resource";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { useResourceEditorStore } from "@/stores/resource-editor-store";

interface ArticleCanvasProps {
	initialPost?: Resource;
}

export const ArticleCanvas = ({ initialPost }: ArticleCanvasProps) => {
	const queryClient = useQueryClient();
	const isPreviewMode = useResourceEditorStore((state) => state.isPreviewMode);
	const showToC = useResourceEditorStore((state) => state.showToC);
	const toggleToC = useResourceEditorStore((state) => state.toggleToC);

	const updateMutation = useMutation({
		mutationFn: updateResource,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["resources"] });
			if (initialPost?.slug) {
				queryClient.invalidateQueries({
					queryKey: ["resource", initialPost.slug],
				});
			}
			toast.success("Article saved successfully");
		},
		onError: (error: Error) => {
			toast.error("Failed to save article", {
				description: error.message,
			});
		},
	});

	const editor = useRichEditor({
		value: initialPost?.article || "<p>Start writing your resource post...</p>",
		minHeight: "calc(100vh - 300px)",
	});

	useEffect(() => {
		if (editor) {
			const isPublished = initialPost?.status === "published";
			editor.setEditable(!isPreviewMode && !isPublished);
		}
	}, [editor, isPreviewMode, initialPost?.status]);

	const handleSave = () => {
		if (!initialPost || !editor) return;
		updateMutation.mutate({
			id: initialPost.id,
			article: editor.getHTML(),
		});
	};

	const isPublished = initialPost?.status === "published";

	return (
		<div className="flex w-full flex-col gap-4">
			<div
				className={cn(
					"flex w-full gap-1 transition-all duration-300",
					showToC ? "flex-row" : "flex-col",
				)}
			>
				{showToC && (
					<div className="sticky top-0 h-screen w-64 shrink-0 overflow-hidden rounded-none border bg-card shadow-sm transition-all">
						<ContentOutline editor={editor} />
					</div>
				)}

				<div className="min-h-screen flex-1 rounded-none border-x-0 border-y shadow-none md:rounded-none md:border md:shadow-sm">
					{!isPreviewMode && (
						<Toolbar
							editor={editor}
							showToC={showToC}
							onToggleToC={toggleToC}
							action={
								!isPublished
									? {
											label: "Save Article",
											onClick: handleSave,
											loading: updateMutation.isPending,
											disabled: !initialPost,
										}
									: undefined
							}
						/>
					)}
					<RichEditor
						editor={editor}
						value={initialPost?.article || ""}
						onChange={() => {}} // Uncontrolled: we don't need to sync back to local state
						hideToolbar
						className="rounded-none border-none bg-transparent shadow-none"
					/>
				</div>
			</div>
		</div>
	);
};